import { configureStore, Middleware } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { chainDataSlice } from './chain';
import { ethereumSlice } from './ethereum';
import { UiSlice } from './ui';


const middleware: Middleware = store => next => action => {
  const actionType: string = action.type;
  if (actionType.endsWith('/rejected')) {
    toast.error(action.error.message);
  }
  return next(action);
}

const store = configureStore({
  reducer: {
    chainData: chainDataSlice.reducer,
    ethereum: ethereumSlice.reducer,
    ui: UiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middleware),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>()

export default store;
