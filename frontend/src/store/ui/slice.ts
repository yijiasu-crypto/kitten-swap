import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { toast } from 'react-toastify';
import store from '..';
import { IPriceRef, IRecentTx } from '../../models';
import { getUnixTimestamp } from '../../utils/datetime';
import { queryAmountOut, performSwap } from './thunks';
import { IEnqueueTxPayload, IUiState } from './types';

const calcBestPrice = (priceRefs: Array<IPriceRef>) => {
  const clonedPriceRefs = _.cloneDeep(priceRefs);
  clonedPriceRefs.sort((a, b) => {
    const bnA = new BigNumber(a.toAmount);
    const bnB = new BigNumber(b.toAmount);
    if (bnA.isLessThan(bnB)) {
      return -1;
    } else if (bnA.isGreaterThan(bnB)) {
      return 1;
    } else {
      return 0;
    }
  });

  return _.last(clonedPriceRefs)!;
};


export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    price: {
      bestPriceRef: undefined,
      priceRefs: new Array<IPriceRef>(),
    },
    recentTx: new Array<IRecentTx>(),
  } as IUiState,
  reducers: {
    becomeBusy: (state) => {
      state.busy = true;
    },
    releaseBusy: (state) => {
      state.busy = false;
    },
    enqueueTx: (state, action: PayloadAction<IEnqueueTxPayload>) => {
        const { description, txHash, network } = action.payload;
        const tx: IRecentTx = {
          status: 'pending',
          timestamp: getUnixTimestamp(),
          description,
          txHash,
          network,
        };

        state.recentTx.push(tx);
    },
    successTx: (state, action: PayloadAction<{ txHash: string }>) => {
      const { txHash } = action.payload;
      const tx = _.find(state.recentTx, { txHash });
      if (tx) {
        tx.status = 'success';
      }
    },
    rejectTx: (state, action: PayloadAction<{ txHash: string }>) => {
      const { txHash } = action.payload;
      const tx = _.find(state.recentTx, { txHash });
      if (tx) {
        tx.status = 'rejected';
      }
    },
    clearAllTx: (state) => {
      state.recentTx = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(queryAmountOut.fulfilled, (state, { payload: priceRefs }) => {
        const bestPriceRef = calcBestPrice(priceRefs);
        return {
          ...state,
          price: {
            bestPriceRef,
            priceRefs,
          },
        };
      })
      .addCase(performSwap.fulfilled, (state, { payload: txReceipt }) => {
        toast.success('Transaction Success!');
        setImmediate(() => {
          store.dispatch(uiSlice.actions.successTx({ txHash: txReceipt.transactionHash }));
        });
        return state;
      });
  },
});
