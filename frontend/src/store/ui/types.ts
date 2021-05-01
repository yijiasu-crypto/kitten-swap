
import { IPriceRef, IRecentTx, ITokenBalance } from '../../models';

export interface IUiState {
  busy: boolean;
  balance: Array<ITokenBalance>;
  price: {
    bestPriceRef?: IPriceRef;
    priceRefs: Array<IPriceRef>;
  };
  recentTx: Array<IRecentTx>;
}

export interface IEnqueueTxPayload {
  network: string;
  txHash: string;
  description: string;
}
