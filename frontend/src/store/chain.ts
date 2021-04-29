import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IContract, IToken } from '../models';

export const chainDataSlice = createSlice({
  name: 'chainData',
  initialState: {
    tokens: new Array<IToken>(),
    contracts: new Array<IContract>(),
  },
  reducers: {
    addToken: {
      prepare: (token: IToken) => ({ payload: token }),
      reducer: (state, action: PayloadAction<IToken>) => {
        console.log('123ggtt');
        state.tokens.push(action.payload)
      }
    },
    addContract: {
      prepare: (contract: IContract) => ({ payload: contract }),
      reducer: (state, action: PayloadAction<IContract>) => {
        state.contracts.push(action.payload)
      }
    }
  }
});