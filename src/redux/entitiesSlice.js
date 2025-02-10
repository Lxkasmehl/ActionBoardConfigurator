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
    deletePropertyFilter(state, action) {
      const { entityName, propertyName } = action.payload;
      if (entityName in state.config) {
        if (propertyName in state.config[entityName].filter) {
          delete state.config[entityName].filter[propertyName];
        }
      }
    },
    addFilter(state, action) {
      const { entityName, propertyName, filterValue } = action.payload;
      if (!state.config[entityName]) {
        state.config[entityName] = { filter: {} };
      }
      if (!state.config[entityName].filter) {
        state.config[entityName].filter = {};
      }
      state.config[entityName].filter[propertyName] = filterValue;
    },
    addPropertySelection(state, action) {
      const { entityName, propertyName } = action.payload;
      state.config[entityName] = state.config[entityName] ?? {
        selectedProperties: [],
      };
      state.config[entityName].selectedProperties = [
        ...new Set([
          ...(state.config[entityName].selectedProperties ?? []),
          propertyName,
        ]),
      ];
    },
    deletePropertySelection(state, action) {
      const { entityName, propertyName } = action.payload;
      if (state.config[entityName]) {
        state.config[entityName].selectedProperties =
          state.config[entityName].selectedProperties?.filter(
            (prop) => prop !== propertyName,
          ) ?? [];
      }
    },
  },
});

export const {
  setFilteredEntities,
  addEntity,
  deleteEntity,
  deletePropertyFilter,
  addFilter,
  addPropertySelection,
  deletePropertySelection,
} = entitiesSlice.actions;

export default entitiesSlice.reducer;
