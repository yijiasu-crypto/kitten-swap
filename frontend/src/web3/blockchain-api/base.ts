import Web3 from 'web3';
import { BaseContract } from '../../contracts/types/types';
import { IContractInterface } from '../../models';

export function wrapWithWeb3<T extends BaseContract>(
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
