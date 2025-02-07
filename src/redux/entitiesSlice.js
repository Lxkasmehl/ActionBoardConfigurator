import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filteredEntities: [],
  selectedEntities: [],
  filters: {},
  currentStep: 0,
  config: {},
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
    setFilters(state, action) {
      const { entityName, filters } = action.payload;
      if (!state.filters[entityName]) {
        state.filters[entityName] = {};
      }
      state.filters[entityName] = { ...state.filters[entityName], ...filters };
    },
    setCurrentStep(state, action) {
      state.currentStep = action.payload;
    },
    addEntity(state, action) {
      state.config = { ...state.config, [action.payload]: {} };
      console.log(state.config);
    },
  },
});

export const {
  setFilteredEntities,
  toggleEntitySelection,
  resetSelectedEntities,
  setFilters,
  setCurrentStep,
  addEntity,
} = entitiesSlice.actions;

export default entitiesSlice.reducer;
