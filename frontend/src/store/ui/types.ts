
import { IPriceRef, IRecentTx } from '../../models';

export interface IUiState {
  busy: boolean;
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
