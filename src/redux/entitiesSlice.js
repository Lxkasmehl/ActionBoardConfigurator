import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filteredEntities: [],
  selectedEntities: [],
  selectedProperties: [],
  currentStep: 0,
};

const entitiesSlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    setFilteredEntities(state, action) {
      state.filteredEntities = action.payload;
    },
    toggleEntitySelection(state, action) {
      const entity = action.payload;
      if (state.selectedEntities.some((e) => e.Name === entity.Name)) {
        state.selectedEntities = state.selectedEntities.filter(
          (e) => e.Name !== entity.Name,
        );
      } else {
        state.selectedEntities.push(entity);
      }
    },
    resetSelectedEntities(state) {
      state.selectedEntities = [];
    },
    togglePropertySelection(state, action) {
      const property = action.payload;
      if (state.selectedProperties.some((p) => p.Name === property.Name)) {
        state.selectedProperties = state.selectedProperties.filter(
          (p) => p.Name !== property.Name,
        );
      } else {
        state.selectedProperties.push(property);
      }
    },
    resetSelectedProperties(state) {
      state.selectedProperties = [];
    },
    setCurrentStep(state, action) {
      state.currentStep = action.payload;
    },
  },
});

export const {
  setFilteredEntities,
  toggleEntitySelection,
  resetSelectedEntities,
  togglePropertySelection,
  resetSelectedProperties,
  setCurrentStep,
} = entitiesSlice.actions;

export default entitiesSlice.reducer;
