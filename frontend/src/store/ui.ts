import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import Web3 from 'web3';
import store from '.';
import { IExchangeAdapter } from '../contracts/types';
import { IPriceRef, TokenPair } from '../models';
import { wrapWithWeb3 } from '../web3/blockchain-api/base';
import { checkERC20Approval, grantERC20Approval, performSwapOnRouter, queryAdapterAmountOut } from '../web3/blockchain-api/erc20';

interface IUiState {
  price: {
    bestPriceRef?: IPriceRef;
    priceRefs: Array<IPriceRef>;
  };
}

export const queryAmountOut = createAsyncThunk(
  'ui/queryAmountOut',
  async (payload: { web3: Web3; tokenPair: TokenPair; amountIn: string }) => {
    const { web3, tokenPair, amountIn } = payload;
    const { contracts } = store.getState().chainData;
    const adapters = _.filter(contracts, { interface: 'IExchangeAdapter' })!;

    const result: Array<IPriceRef> = [];
    for (const adapter of adapters) {

      const amountOut = await queryAdapterAmountOut(web3, adapter.address, {
        tokenPair,
        amountIn,
      });
      
      result.push({
        fromAmount: amountIn,
        toAmount: amountOut,
        fromToken: tokenPair[0],
        toToken: tokenPair[1],
        adapter: adapter.name,
      });
    }

    return result;
  }
);

export const performSwap = createAsyncThunk(
  'ui/performSwap',
  async (payload: { web3: Web3; tokenPair: TokenPair; amountIn: string, amountOutMin: string }) => {
    const { web3, tokenPair, amountIn, amountOutMin } = payload;
    const { contracts } = store.getState().chainData;
    const ksrContract = _.find(contracts, { name: 'KittenSwapRouter' })!;
    const ownerAddress = store.getState().ethereum.account;
    const isApproved = await checkERC20Approval(web3, tokenPair[0].address, {
      owner: ownerAddress,
      spender: ksrContract.address,
    });

    if (!isApproved) {
      // need ERC20 Approval
      const approveTxReceipt = await grantERC20Approval(web3, tokenPair[0].address, {
        owner: ownerAddress,
        spender: ksrContract.address,
      });
      console.log(approveTxReceipt);
    }

    // perform actual swap
    const swapTxReceipt = await performSwapOnRouter(web3, ksrContract.address, {
      amountIn,
      amountOutMin,
      tokenPair,
      beneficiaryAddress: ownerAddress
    });

    console.log(swapTxReceipt);
  }
)

const calcBestPrice = (priceRefs: Array<IPriceRef>) => {
  const clonedPriceRefs = _.cloneDeep(priceRefs);
  clonedPriceRefs.sort((a, b) => {
    const bnA = new BigNumber(a.toAmount);
    const bnB = new BigNumber(b.toAmount);
    if (bnA.isLessThan(bnB)) {
      return -1;
    } else if (bnA.isGreaterThan(bnB)) {
      return 1;
    } else {
      return 0;
    }
  });

  return _.last(clonedPriceRefs)!;
};

export const UiSlice = createSlice({
  name: 'ui',
  initialState: {
    price: {
      bestPriceRef: undefined,
      priceRefs: new Array<IPriceRef>(),
    },
  } as IUiState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(queryAmountOut.fulfilled, (state, { payload }) => {
      const bestPriceRef = calcBestPrice(payload);
      return {
        ...state,
        price: {
          bestPriceRef,
          priceRefs: payload,
        },
      };
    });
  },
});
