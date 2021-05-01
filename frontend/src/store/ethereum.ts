import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IEthereumAccountPayload } from '../models';


const chainIdToNetworkMapping: { [chainId: string]: string } = {
  '1': 'Mainnet',
  '3': 'Ropsten',
  '42': 'Kovan',
};

export const ethereumSlice = createSlice({
  name: 'ethereum',
  initialState: {
    active: false,
    account: '',
    chainId: 0,
    networkName: '',
  },
  reducers: {
    activate: {
      prepare: (payload: IEthereumAccountPayload) => ({ payload }),
      reducer: (state, action: PayloadAction<IEthereumAccountPayload>) => {
        return {
          ...state,
          ...action.payload,
          ...{
            networkName:
              chainIdToNetworkMapping[action.payload.chainId.toString()] ??
              'Unknown',
          },
        };
      },
    },
    deactivate: (state) => {
      state.active = false;
      state.account = '';
      state.chainId = 0;
    },
  },
});
