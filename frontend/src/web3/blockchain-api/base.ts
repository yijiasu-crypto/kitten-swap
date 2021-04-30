import Web3 from 'web3';
// import { KittenSwapRouter } from '../contracts/types/KittenSwapRouter';
// const { abi } = require('../contracts/artifacts/KittenSwapRouter.json');

// const KittenSwapRouter = (web3: Web3) => {
//   const ksrInstance = (new web3.eth.Contract())
// }
import { BaseContract } from '../../contracts/types/types';
import { IContract, IContractInterface } from '../../models';

// type Keys = keyof types;

export function wrapWithWeb3<T extends BaseContract>(
  web3: Web3,
  contract: IContract
): T {
  if (!contract.abi) {
    throw new Error('ABI is not defined');
  }
  if (!contract.address) {
    throw new Error('Address is not defined');
  }

  const instance = (new web3.eth.Contract(
    JSON.parse(contract.abi),
    contract.address
  ) as any) as T;
  return instance;
}

export function wrapWithWeb3Interface<T extends BaseContract>(
  web3: Web3,
  contractAddress: string,
  contractInterface: IContractInterface,
): T {
  if (!contractInterface.abi) {
    throw new Error('ABI is not defined');
  }
  if (!contractAddress) {
    throw new Error('Address is not defined');
  }

  const instance = (new web3.eth.Contract(
    JSON.parse(contractInterface.abi),
    contractAddress
  ) as any) as T;
  return instance;
}
