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
      const { id, entityName } = action.payload;
      state.config = {
        ...state.config,
        [id]: {
          ...state.config[id],
          [entityName]: { filter: {}, selectedProperties: [] },
        },
      };
    },
    deleteEntity(state, action) {
      const { id, entityName } = action.payload;
      if (state.config[id] && state.config[id][entityName]) {
        delete state.config[id][entityName];
      }
    },
    deletePropertyFilter(state, action) {
      const { entityName, propertyName, id } = action.payload;
      if (
        state.config[id] &&
        state.config[id][entityName] &&
        state.config[id][entityName].filter
      ) {
        delete state.config[id][entityName].filter[propertyName];
      }
    },
    addFilter(state, action) {
      const { entityName, propertyName, filterValue, id } = action.payload;
      if (!state.config[id]) {
        state.config[id] = { [entityName]: { filter: {} } };
      }
      if (!state.config[id][entityName]) {
        state.config[id][entityName] = { filter: {} };
      }
      if (!state.config[id][entityName].filter) {
        state.config[id][entityName].filter = {};
      }
      state.config[id][entityName].filter[propertyName] = filterValue;
    },
    addPropertySelection(state, action) {
      const { entityName, propertyName, id } = action.payload;
      if (!state.config[id]) {
        state.config[id] = {};
      }
      if (!state.config[id][entityName]) {
        state.config[id][entityName] = { filter: {}, selectedProperties: [] };
      }
      state.config[id][entityName].selectedProperties = [
        ...new Set([
          ...(state.config[id][entityName].selectedProperties ?? []),
          propertyName,
        ]),
      ];
    },
    deletePropertySelection(state, action) {
      const { entityName, propertyName, id } = action.payload;
      if (state.config[id]?.[entityName]?.selectedProperties) {
        state.config[id][entityName].selectedProperties = state.config[id][
          entityName
        ].selectedProperties.filter((prop) => prop !== propertyName);
      }
    },
    deleteID(state, action) {
      if (state.config[action.payload]) {
        delete state.config[action.payload];
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
  deleteID,
} = entitiesSlice.actions;

export default entitiesSlice.reducer;
