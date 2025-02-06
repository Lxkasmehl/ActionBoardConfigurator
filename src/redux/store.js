// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import entitiesReducer from './entitiesSlice';

const store = configureStore({
  reducer: {
    entities: entitiesReducer,
  },
});

export default store;
