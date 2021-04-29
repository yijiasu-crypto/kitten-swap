import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IContract, IToken } from '../models';

export const fetchContractAbi = createAsyncThunk(
  'chainData/fetchContractAbi',
  async (contractInterface: string) => {
    const resp = await fetch(`/abi/${contractInterface}.json`).then((resp) =>
      resp.json()
    );
    return { contractInterface: contractInterface, abi: JSON.stringify((resp as any).abi) };
  }
);

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
        state.tokens.push(action.payload);
      },
    },
    addContract: {
      prepare: (contract: IContract) => ({ payload: contract }),
      reducer: (state, action: PayloadAction<IContract>) => {
        state.contracts.push(action.payload);
      },
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchContractAbi.fulfilled,
      (state, { payload: { contractInterface, abi } }) => {
        const contracts = state.contracts.filter(c => c.interface === contractInterface);
        for (const contract of contracts) {
          contract.abi = abi;
        }
      }
    );
  },
});
