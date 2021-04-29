import { Optional } from '../utils/optional-type';

export interface IToken {
  symbol: string;
  address: string;
  decimals: number;
}

export interface IContract {
  name: string;
  address: string;
}

export interface IEthereumAccountPayload {
  active: boolean;
  account: string;
  chainId: number;
}

export type OptionalTokenPair = [Optional<IToken>, Optional<IToken>];
export type TokenPair = [IToken, IToken];
