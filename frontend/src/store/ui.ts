import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { toast } from 'react-toastify';
import Web3 from 'web3';
import store from '.';
import { IPriceRef, IRecentTx, TokenPair } from '../models';
import { getUnixTimestamp } from '../utils/datetime';
import { fromStringNumber } from '../utils/math';
import {
  checkERC20Approval,
  grantERC20Approval,
  performSwapOnRouter,
  queryAdapterAmountOut,
} from '../web3/blockchain-api/erc20';

interface IUiState {
  busy: boolean;
  price: {
    bestPriceRef?: IPriceRef;
    priceRefs: Array<IPriceRef>;
  };
  recentTx: Array<IRecentTx>;
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
  async (payload: {
    web3: Web3;
    tokenPair: TokenPair;
    amountIn: string;
    amountOut: string;
    amountOutMin: string;
  }) => {
    const { web3, tokenPair, amountIn, amountOut, amountOutMin } = payload;
    const { contracts } = store.getState().chainData;
    const ksrContract = _.find(contracts, { name: 'KittenSwapRouter' })!;
    const ownerAddress = store.getState().ethereum.account;
    const isApproved = await checkERC20Approval(web3, tokenPair[0].address, {
      owner: ownerAddress,
      spender: ksrContract.address,
    });

    if (!isApproved) {
      // need ERC20 Approval
      const approveTxReceipt = await grantERC20Approval(
        web3,
        tokenPair[0].address,
        {
          owner: ownerAddress,
          spender: ksrContract.address,
        }
      );
      console.log(approveTxReceipt);
    }

    // perform actual swap
    const swapTxReceipt = await performSwapOnRouter(web3, ksrContract.address, {
      amountIn,
      amountOutMin,
      tokenPair,
      beneficiaryAddress: ownerAddress,
    });

    const state = store.getState();

    const dispFromAmountAndToken = `${fromStringNumber(amountIn, tokenPair[0].decimals, 4)} ${tokenPair[0].symbol}`;
    const dispToAmountAndToken = `${fromStringNumber(amountOut, tokenPair[1].decimals, 4)} ${tokenPair[1].symbol}`;
    
    store.dispatch(
      uiSlice.actions.enqueueTx({
        txHash: swapTxReceipt.transactionHash,
        network: state.ethereum.networkName,
        description: `Swap ${dispFromAmountAndToken} to ${dispToAmountAndToken}`,
      })
    );
    console.log(swapTxReceipt);

    return swapTxReceipt;
  }
);

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

interface IEnqueueTxPayload {
  network: string;
  txHash: string;
  description: string;
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    price: {
      bestPriceRef: undefined,
      priceRefs: new Array<IPriceRef>(),
    },
    recentTx: new Array<IRecentTx>(),
  } as IUiState,
  reducers: {
    becomeBusy: (state) => {
      state.busy = true;
    },
    releaseBusy: (state) => {
      state.busy = false;
    },
    enqueueTx: (state, action: PayloadAction<IEnqueueTxPayload>) => {
        const { description, txHash, network } = action.payload;
        const tx: IRecentTx = {
          status: 'pending',
          timestamp: getUnixTimestamp(),
          description,
          txHash,
          network,
        };

        state.recentTx.push(tx);
    },
    successTx: (state, action: PayloadAction<{ txHash: string }>) => {
      const { txHash } = action.payload;
      const tx = _.find(state.recentTx, { txHash });
      if (tx) {
        tx.status = 'success';
      }
    },
    rejectTx: (state, action: PayloadAction<{ txHash: string }>) => {
      const { txHash } = action.payload;
      const tx = _.find(state.recentTx, { txHash });
      if (tx) {
        tx.status = 'rejected';
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(queryAmountOut.fulfilled, (state, { payload: priceRefs }) => {
        const bestPriceRef = calcBestPrice(priceRefs);
        return {
          ...state,
          price: {
            bestPriceRef,
            priceRefs,
          },
        };
      })
      .addCase(performSwap.fulfilled, (state, { payload: txReceipt }) => {
        toast.success('Transaction Success!');
        setImmediate(() => {
          store.dispatch(uiSlice.actions.successTx({ txHash: txReceipt.transactionHash }));
        })
        return state;
      });
  },
});
