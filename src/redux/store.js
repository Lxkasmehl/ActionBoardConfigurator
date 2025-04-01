import { configureStore } from '@reduxjs/toolkit';
import entitiesReducer from './entitiesSlice';
import { loadState, saveState } from './persistence';

const preloadedState = loadState();

const store = configureStore({
  reducer: {
    entities: entitiesReducer,
  },
  preloadedState,
});

store.subscribe(() => {
  const state = store.getState();
  saveState(state);
});

export default store;
