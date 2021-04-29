import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';
import Web3 from 'web3';
import store from '.';
import { IExchangeAdapter } from '../contracts/types';
import { IAdapter, IContract, IEthereumAccountPayload, IPriceRef, TokenPair } from '../models';
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
        adapter: adapter.name
      });
    }

    return result

  }
);


export const UiSlice = createSlice({
  name: 'ui',
  initialState: {
    fromAmount: '0',
    toAmount: '0',
    priceRef: new Array<IPriceRef>()
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(queryAmountOut.fulfilled, (state, { payload }) => {
      return {...state, priceRef: payload}
    })
  }
});
