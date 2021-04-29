import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IEthereumAccountPayload {
  active: boolean;
  account: string;
  chainId: number;
}

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
        console.log(action.payload);
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
