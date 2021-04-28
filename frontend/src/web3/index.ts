import Web3 from 'web3';
export function getWeb3Library(provider: any) {
  return new Web3(provider);
}
