import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import Web3 from 'web3';
import store from '.';
import { IExchangeAdapter } from '../contracts/types';
import { IPriceRef, TokenPair } from '../models';
import { wrapWithWeb3 } from '../web3/blockchain-api/base';

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
      const adapterContract = wrapWithWeb3<IExchangeAdapter>(web3, adapter);

      const amountOut = await adapterContract.methods
        .getAmountOutByTokenPair(
          amountIn,
          tokenPair[1].address,
          tokenPair[0].address
        )
        .call();

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
