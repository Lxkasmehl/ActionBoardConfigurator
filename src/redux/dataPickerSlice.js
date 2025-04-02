import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  propertyOptions: {},
  formData: {},
  entityLogic: {},
  groupedEntityLogic: {},
  selectedEntities: {},
  selectedProperties: {},
  filterStorageForNodesNotConnectedToEdges: {},
  propertiesBySection: {},
  matchingEntityObjects: {},
  matchingEntitiesForAccordions: {},
  selectedPropertiesInAccordions: {},
};

const dataPickerSlice = createSlice({
  name: 'dataPicker',
  initialState,
  reducers: {
    setPropertyOptions(state, action) {
      const { id, properties } = action.payload;
      state.propertyOptions[id] = properties;
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

    setFilterStorageForNodesNotConnectedToEdges(state, action) {
      const { id, filterObject } = action.payload;
      state.filterStorageForNodesNotConnectedToEdges[id] = { ...filterObject };
    },

    setPropertiesBySection(state, action) {
      const { id, propertiesBySection } = action.payload;
      state.propertiesBySection[id] = propertiesBySection;
    },

    setMatchingEntityObjects(state, action) {
      const { id, matchingEntityObjects } = action.payload;
      state.matchingEntityObjects[id] = matchingEntityObjects;
    },

    setMatchingEntitiesForAccordions(state, action) {
      const { id, matchingEntities } = action.payload;
      state.matchingEntitiesForAccordions[id] = matchingEntities;
    },

    setSelectedPropertiesInAccordions(state, action) {
      const { id, accordionSelectedProperties } = action.payload;
      state.selectedPropertiesInAccordions[id] = accordionSelectedProperties;
    },
  },
});

export const {
  setPropertyOptions,
  setFormData,
  removeFormData,
  setEntityLogic,
  setGroupedEntityLogic,
  removeGroupedEntityLogic,
  setSelectedEntity,
  setSelectedProperties,
  setFilterStorageForNodesNotConnectedToEdges,
  setPropertiesBySection,
  setMatchingEntityObjects,
  setMatchingEntitiesForAccordions,
  setSelectedPropertiesInAccordions,
} = dataPickerSlice.actions;

export default dataPickerSlice.reducer;
