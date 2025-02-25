import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filteredEntities: [],
  allEntities: [],
  config: {},
  propertyOptions: {},
  formData: {},
  entityLogic: {},
  groupedEntityLogic: {},
  selectedEntities: {},
  selectedProperties: {},
  customFilters: {},
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

//TODO: different slices

const entitiesSlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    setFilteredEntities(state, action) {
      state.filteredEntities = action.payload;
    },

    setAllEntities(state, action) {
      state.allEntities = action.payload;
    },

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

    setPropertyOptions(state, action) {
      const { id, properties } = action.payload;
      state.propertyOptions[id] = properties;
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
      const { id } = action.payload;
      if (state.config[id]) {
        delete state.config[id];
      }
    },

    setFormData(state, action) {
      const { id, formObject } = action.payload;
      state.formData[id] = { ...formObject };
    },

    removeFormData(state, action) {
      const { id } = action.payload;
      delete state.formData[id];
    },

    setEntityLogic(state, action) {
      const { id, entityLogic } = action.payload;
      state.entityLogic[id] = entityLogic;
    },

    setGroupedEntityLogic(state, action) {
      const { id, entityLogic, groupIndex } = action.payload;
      if (!state.groupedEntityLogic[id]) {
        state.groupedEntityLogic[id] = {};
      }
      state.groupedEntityLogic[id][groupIndex] = entityLogic;
    },

    removeGroupedEntityLogic(state, action) {
      const { id, groupIndex } = action.payload;
      if (state.groupedEntityLogic[id]) {
        delete state.groupedEntityLogic[id][groupIndex];
      }
    },

    setSelectedEntity(state, action) {
      const { id, entityName } = action.payload;
      state.selectedEntities[id] = entityName;
    },

    setSelectedProperties(state, action) {
      const { id, propertyNames } = action.payload;
      state.selectedProperties[id] = propertyNames;
    },

    setCustomFilter(state, action) {
      const { id, filterObject } = action.payload;
      state.customFilters[id] = { ...filterObject };
    },
  },
});

export const {
  setFilteredEntities,
  setAllEntities,
  addEntity,
  removeEntity,
  setPropertyOptions,
  setEntityFilter,
  setPropertySelection,
  removeEntityConfig,
  setFormData,
  removeFormData,
  setEntityLogic,
  setGroupedEntityLogic,
  removeGroupedEntityLogic,
  setSelectedEntity,
  setSelectedProperties,
  setCustomFilter,
} = entitiesSlice.actions;

export default entitiesSlice.reducer;
