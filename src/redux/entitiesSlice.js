import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  config: {},
};

const initializeEntityConfig = (state, id, entityName) => {
  if (!state.config[id]) {
    state.config[id] = {};
  }
  if (!state.config[id][entityName]) {
    state.config[id][entityName] = {
      filter: {},
      selectedProperties: [],
    };
  }
};

const entitiesSlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    addEntity(state, action) {
      const { id, entityName } = action.payload;
      initializeEntityConfig(state, id, entityName);
    },

    removeEntity(state, action) {
      const { id, entityName } = action.payload;
      if (state.config[id] && state.config[id][entityName]) {
        delete state.config[id][entityName];
      }
    },

    setEntityFilter(state, action) {
      const { id, entityName, filterObject } = action.payload;
      initializeEntityConfig(state, id, entityName);
      state.config[id][entityName].filter = { ...filterObject };
    },

    setPropertySelection(state, action) {
      const { id, entityName, propertyNames } = action.payload;
      initializeEntityConfig(state, id, entityName);
      state.config[id][entityName].selectedProperties = propertyNames;
    },

    removeEntityConfig(state, action) {
      const { id, entityName } = action.payload;
      initializeEntityConfig(state, id, entityName);
      if (state.config[id]) {
        delete state.config[id];
      }
    },
  },
});

export const {
  addEntity,
  removeEntity,
  setEntityFilter,
  setPropertySelection,
  removeEntityConfig,
} = entitiesSlice.actions;

export default entitiesSlice.reducer;
