import { configureStore } from '@reduxjs/toolkit';
import entitiesReducer from './entitiesSlice';
import fetchedDataReducer from './fetchedDataSlice';
import dataPickerReducer from './dataPickerSlice';
import { loadState, saveState } from './persistence';

const preloadedState = loadState();

const store = configureStore({
  reducer: {
    entities: entitiesReducer,
    fetchedData: fetchedDataReducer,
    dataPicker: dataPickerReducer,
  },
  preloadedState,
});

store.subscribe(() => {
  const state = store.getState();
  saveState(state);
});

export default store;
