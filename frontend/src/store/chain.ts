import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';
import { IContract, IContractInterface, IToken } from '../models';

export const fetchContractAbi = createAsyncThunk(
  'chainData/fetchContractAbi',
  async (contractInterface: string) => {
    const resp = await fetch(`/abi/${contractInterface}.json`).then((resp) =>
      resp.json()
    );
    return { contractInterface: contractInterface, abi: JSON.stringify((resp as any).abi) };
  }
);

export const fetchContractInterface = createAsyncThunk(
  'chainData/fetchContractInterface',
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
    interfaces: new Array<IContractInterface>(),
  },
  reducers: {
    addToken: {
      prepare: (token: IToken) => ({ payload: token }),
      reducer: (state, action: PayloadAction<IToken>) => {
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
    ).addCase(
      fetchContractInterface.fulfilled,
      (state, { payload: { contractInterface, abi } }) => {
        if (!_.find(state.interfaces, { interface: contractInterface })) {
          return {
            ...state,
            interfaces: [
              ...state.interfaces,
              {
                abi,
                interface: contractInterface,
              }
            ]
          };
        }
      }
    );
  },
});
