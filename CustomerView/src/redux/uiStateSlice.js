import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  visibleColumns: {},
  selectedFilters: {},
  selectedFilterOptions: {},
  loading: false,
  error: null,
};

const uiStateSlice = createSlice({
  name: 'uiState',
  initialState,
  reducers: {
    setVisibleColumns: (state, action) => {
      const { tableComponentId, columns } = action.payload;
      state.visibleColumns[tableComponentId] = columns;
    },
    setSelectedFilters: (state, action) => {
      const { tableComponentId, filters } = action.payload;
      state.selectedFilters[tableComponentId] = filters;
    },
    setSelectedFilterOptions: (state, action) => {
      const { tableComponentId, options } = action.payload;
      if (!state.selectedFilterOptions[tableComponentId]) {
        state.selectedFilterOptions[tableComponentId] = {};
      }
      state.selectedFilterOptions[tableComponentId] = {
        ...state.selectedFilterOptions[tableComponentId],
        ...options,
      };
    },
    clearFilters: (state, action) => {
      const { tableComponentId } = action.payload;
      if (tableComponentId) {
        state.selectedFilters[tableComponentId] = {};
        state.selectedFilterOptions[tableComponentId] = {};
      } else {
        state.selectedFilters = {};
        state.selectedFilterOptions = {};
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setVisibleColumns,
  setSelectedFilters,
  setSelectedFilterOptions,
  clearFilters,
  setLoading,
  setError,
  clearError,
} = uiStateSlice.actions;
export default uiStateSlice.reducer;
