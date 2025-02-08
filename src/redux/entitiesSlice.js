import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filteredEntities: [],
  config: {},
};

const entitiesSlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    setFilteredEntities(state, action) {
      state.filteredEntities = action.payload;
    },
    addEntity(state, action) {
      state.config = { ...state.config, [action.payload]: {} };
      console.log(state.config);
    },
    deleteEntity(state, action) {
      if (action.payload in state.config) {
        delete state.config[action.payload];
      }
    },
  },
});

export const { setFilteredEntities, addEntity, deleteEntity } = entitiesSlice.actions;

export default entitiesSlice.reducer;
