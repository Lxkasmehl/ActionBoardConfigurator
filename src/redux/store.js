import { configureStore } from '@reduxjs/toolkit';
import configReducer from './configSlice';
import fetchedDataReducer from './fetchedDataSlice';
import dataPickerReducer from './dataPickerSlice';
import uiBuilderReducer from './uiBuilderSlice';
import { loadState, saveState } from './persistence';

const preloadedState = loadState();

const store = configureStore({
  reducer: {
    config: configReducer,
    fetchedData: fetchedDataReducer,
    dataPicker: dataPickerReducer,
    uiBuilder: uiBuilderReducer,
  },
  preloadedState,
});

store.subscribe(() => {
  const state = store.getState();
  saveState(state);
});

export default store;
