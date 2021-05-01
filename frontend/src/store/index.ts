import { combineReducers, configureStore, Middleware } from '@reduxjs/toolkit';
import _ from 'lodash';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { chainDataSlice } from './chain';
import { ethereumSlice } from './ethereum';
import { performSwap, queryAmountOut, uiSlice } from './ui';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

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

const middleware: Middleware = store => next => action => {
  const actionType: string = action.type;
  if (actionType.endsWith('/rejected')) {
    console.error(action.error);
    toast.error(action.error.message);
  }
  if (_.includes(toBecomeBusyActions, actionType)) {
    store.dispatch(uiSlice.actions.becomeBusy());
  }
  if (_.includes(toReleaseBusyActions, actionType)) {
    store.dispatch(uiSlice.actions.releaseBusy());
  }
  return next(action);

};

const rootReducer = combineReducers({
  chainData: chainDataSlice.reducer,
  ethereum: ethereumSlice.reducer,
  ui: persistReducer({ key: 'root', storage, whitelist: ['recentTx']}, uiSlice.reducer),
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middleware),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
