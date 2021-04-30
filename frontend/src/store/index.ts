import { configureStore, Middleware } from '@reduxjs/toolkit';
import _ from 'lodash';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { chainDataSlice } from './chain';
import { ethereumSlice } from './ethereum';
import { performSwap, queryAmountOut, uiSlice } from './ui';

const toBecomeBusyActions = [
  performSwap.pending.toString(),
  queryAmountOut.pending.toString()
];

const toReleaseBusyActions = [
  performSwap.fulfilled.toString(),
  queryAmountOut.fulfilled.toString(),
  performSwap.rejected.toString(),
  queryAmountOut.rejected.toString(),
];


console.log(toBecomeBusyActions);
const middleware: Middleware = store => next => action => {
  const actionType: string = action.type;
  if (actionType.endsWith('/rejected')) {
    toast.error(action.error.message);
  }
  if (_.includes(toBecomeBusyActions, actionType)) {
    store.dispatch(uiSlice.actions.becomeBusy())
  }
  if (_.includes(toReleaseBusyActions, actionType)) {
    store.dispatch(uiSlice.actions.releaseBusy())
  }
  return next(action);

}

const store = configureStore({
  reducer: {
    chainData: chainDataSlice.reducer,
    ethereum: ethereumSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middleware),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>()

export default store;
