import _ from 'lodash';
import Web3 from 'web3';
import { IExchangeAdapter } from '../../contracts/types';
import { KittenSwapRouter } from '../../contracts/types/KittenSwapRouter';
import { IAdapter, IContract } from '../../models';
import store from '../../store';
import { wrapWithWeb3 } from './base';

const findContractByName = (name: string) => {
  const { contracts } = store.getState().chainData;
  return _.find(contracts, { name })!;
};



// const fetchAdapterData = async (web3: Web3, contract: IContract): IAdapter => {
//   if (contract.interface !== 'IExchangeAdapter') {
//     throw new Error('Invalid adapter contract interface');
//   }

//   const adapterInstance = wrapWithWeb3<IExchangeAdapter>(
//     web3,
//     contract
//   );

//   const reserver = adapterInstance.methods.

// };
// };
