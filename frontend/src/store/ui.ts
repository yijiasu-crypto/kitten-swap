import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import Web3 from 'web3';
import store from '.';
import { IExchangeAdapter } from '../contracts/types';
import { IPriceRef, TokenPair } from '../models';
import { wrapWithWeb3 } from '../web3/blockchain-api/base';


export const queryAmountOut = createAsyncThunk(
  'ui/queryAmountOut',
  async (payload: { web3: Web3, tokenPair: TokenPair, amountIn: string }) => {
    const { web3, tokenPair, amountIn} = payload;
    const { contracts } = store.getState().chainData;
    const adapters = _.filter(contracts, { interface: "IExchangeAdapter" })!;

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
        adapter: adapter.name
      });
    }

    return result

  }
);

const calcBestPrice = (priceRefs: Array<IPriceRef>) => {
  const clonedPriceRefs = _.cloneDeep(priceRefs);
  clonedPriceRefs.sort((a, b) => {
    const bnA = new BigNumber(a.toAmount);
    const bnB = new BigNumber(b.toAmount);
    if (bnA.isLessThan(bnB)) {
      return -1;
    }
    else if (bnA.isGreaterThan(bnB)) {
      return 1;
    }
    else {
      return 0;
    }
  })

  return _.last(clonedPriceRefs)!;
}

export const UiSlice = createSlice({
  name: 'ui',
  initialState: {
    fromAmount: '0',
    bestAdapterName: '',
    bestToAmount: '0',
    priceRef: new Array<IPriceRef>()
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(queryAmountOut.fulfilled, (state, { payload }) => {
      const bestPriceRef = calcBestPrice(payload);
      return {
        ...state,
        priceRef: payload,
        bestAdapterName: bestPriceRef.adapter,
        bestToAmount: bestPriceRef.toAmount,
      };
    })
  }
});
