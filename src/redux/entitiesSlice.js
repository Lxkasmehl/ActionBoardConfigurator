import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filteredEntities: [],
  config: {},
  propertyOptions: {},
  rawFormData: {},
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
    setPropertyOptions(state, action) {
      const { id, properties } = action.payload;
      state.propertyOptions[id] = properties;
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
    setFilter(state, action) {
      const { entityName, id, filterObject } = action.payload;
      state.config[id] = state.config[id] ?? {};
      state.config[id][entityName] = state.config[id][entityName] ?? {
        filter: {},
        selectedProperties: [],
      };
      state.config[id][entityName].filter = {
        ...filterObject,
      };
    },
    setPropertySelection(state, action) {
      const { entityName, propertyNames, id } = action.payload;
      if (!state.config[id]) {
        state.config[id] = {};
      }
      if (!state.config[id][entityName]) {
        state.config[id][entityName] = { filter: {}, selectedProperties: [] };
      }
      state.config[id][entityName].selectedProperties = propertyNames;
    },
    deleteID(state, action) {
      if (state.config[action.payload]) {
        delete state.config[action.payload];
      }
    },
    setRawFormData(state, action) {
      const { id, formObject } = action.payload;
      state.rawFormData[id] = state.rawFormData[id] ?? {};
      state.rawFormData[id] = { ...formObject };
    },
    deleteRawFormDataForId(state, action) {
      const { id } = action.payload;
      if (state.rawFormData[id]) {
        delete state.rawFormData[id];
      }
    },
  },
});

export const {
  setFilteredEntities,
  addEntity,
  deleteEntity,
  setPropertyOptions,
  deletePropertyFilter,
  setFilter,
  setPropertySelection,
  deleteID,
  setRawFormData,
  deleteRawFormDataForId,
} = entitiesSlice.actions;

export default entitiesSlice.reducer;
