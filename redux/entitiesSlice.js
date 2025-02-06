import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  relevantEntities: [],
  selectedEntities: [],
  selectedProperties: [],
  currentStep: 0,
};

const entitiesSlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    setEntities(state, action) {
      state.relevantEntities = action.payload;
    },
    toggleEntitySelection(state, action) {
      const entity = action.payload;
      if (state.selectedEntities.includes(entity)) {
        state.selectedEntities = state.selectedEntities.filter(
          (e) => e !== entity,
        );
      } else {
        state.selectedEntities.push(entity);
      }
    },
    togglePropertySelection(state, action) {
      const property = action.payload;
      if (state.selectedProperties.includes(property)) {
        state.selectedProperties = state.selectedProperties.filter(
          (p) => p !== property,
        );
      } else {
        state.selectedProperties.push(property);
      }
    },
    setCurrentStep(state, action) {
      state.currentStep = action.payload;
    },
  },
});

export const {
  setEntities,
  toggleEntitySelection,
  togglePropertySelection,
  setCurrentStep,
} = entitiesSlice.actions;

export default entitiesSlice.reducer;
