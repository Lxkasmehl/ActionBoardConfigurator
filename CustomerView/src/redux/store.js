import { configureStore } from '@reduxjs/toolkit';
import uiStateSlice from './uiStateSlice';
import dataSlice from './dataSlice';

export const store = configureStore({
  reducer: {
    uiState: uiStateSlice,
    data: dataSlice,
  },
});

export default store;
