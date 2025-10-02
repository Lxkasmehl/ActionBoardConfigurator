import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  visibleColumns: {},
  selectedFilters: {},
  selectedFilterOptions: {},
  appliedFilters: {}, // New state for actually applied filters
  groupFilters: {},
  groupSortConfigs: {},
  sortModalOpen: { isOpen: false, componentId: null },
  columnSelectorModalOpen: { isOpen: false, componentId: null },
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
        state.appliedFilters[tableComponentId] = {};
      } else {
        state.selectedFilters = {};
        state.selectedFilterOptions = {};
        state.appliedFilters = {};
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
    setGroupFilters: (state, action) => {
      const { groupName, filters } = action.payload;
      state.groupFilters[groupName] = filters;
    },
    setGroupSortConfigs: (state, action) => {
      const { groupName, config } = action.payload;
      state.groupSortConfigs[groupName] = config;
    },
    setSortModalOpen: (state, action) => {
      state.sortModalOpen = action.payload;
    },
    setColumnSelectorModalOpen: (state, action) => {
      state.columnSelectorModalOpen = action.payload;
    },
    applyFilters: (state, action) => {
      const { tableComponentId } = action.payload;
      // Apply the selected filter options to the applied filters
      state.appliedFilters[tableComponentId] = {
        ...state.selectedFilterOptions[tableComponentId],
      };
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
  setGroupFilters,
  setGroupSortConfigs,
  setSortModalOpen,
  setColumnSelectorModalOpen,
  applyFilters,
} = uiStateSlice.actions;
export default uiStateSlice.reducer;
