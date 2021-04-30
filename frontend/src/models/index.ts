import { Optional } from '../utils/optional-type';

export interface IToken {
  symbol: string;
  address: string;
  decimals: number;
}

export interface IContract {
  name: string;
  interface: string;
  address: string;
  abi?: string;     // use string instead of object to avoid redux influence
}

export interface IContractInterface {
  interface: string;
  abi: string;
}

export interface IEthereumAccountPayload {
  active: boolean;
  account: string;
  chainId: number;
}

export interface ITradablePair {
  token0: IToken;
  token1: IToken;
  reserve0: string;
  reserve1: string;
}

export interface IAdapter {
  name: string;
  address: string;
  pairs: Array<ITradablePair>;
}

export interface IPriceRef {
  adapter: string;
  fromAmount: string;
  toAmount: string;
  fromToken: IToken;
  toToken: IToken;
}

export type OptionalTokenPair = [Optional<IToken>, Optional<IToken>];
export type TokenPair = [IToken, IToken];
