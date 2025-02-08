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
    addProperty(state, action) {
      const { entityName, propertyName } = action.payload;
      if (state.config[entityName]) {
        state.config[entityName] = {
          ...state.config[entityName],
          [propertyName]: '',
        };
      }
      console.log(state.config[entityName]);
    },
    deleteProperty(state, action) {
      const { entityName, propertyName } = action.payload;
      if (entityName in state.config) {
        if (propertyName in state.config[entityName]) {
          delete state.config[entityName][propertyName];
        }
      }
      console.log(state.config[entityName]);
    },
  },
});

export const {
  setFilteredEntities,
  addEntity,
  deleteEntity,
  addProperty,
  deleteProperty,
} = entitiesSlice.actions;

export default entitiesSlice.reducer;
