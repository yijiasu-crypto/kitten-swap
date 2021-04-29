import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { chainDataSlice } from './chain';
import { ethereumSlice } from './ethereum';
import { UiSlice } from './ui';

const store = configureStore({
  reducer: {
    chainData: chainDataSlice.reducer,
    ethereum: ethereumSlice.reducer,
    ui: UiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>()

export default store;
