import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filteredEntities: [],
  selectedEntities: [],
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
    setCurrentStep(state, action) {
      state.currentStep = action.payload;
    },
  },
});

export const {
  setFilteredEntities,
  toggleEntitySelection,
  resetSelectedEntities,
  setCurrentStep,
} = entitiesSlice.actions;

export default entitiesSlice.reducer;
