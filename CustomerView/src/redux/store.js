import { configureStore } from '@reduxjs/toolkit';
import uiStateSlice from './uiStateSlice';
import dataSlice from './dataSlice';
import configSelectorSlice from './configSelectorSlice';

export const store = configureStore({
  reducer: {
    uiState: uiStateSlice,
    data: dataSlice,
    configSelector: configSelectorSlice,
  },
});

export default store;
