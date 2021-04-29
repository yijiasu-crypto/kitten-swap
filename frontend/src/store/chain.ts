import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IToken {
  symbol: string;
  address: string;
  decimals: number;
}

interface IContract {
  name: string;
  address: string;
}

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