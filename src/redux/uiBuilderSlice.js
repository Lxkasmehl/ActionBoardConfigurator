import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isInCreateGroupMode: false,
  workingSelectedComponents: [],
  tableColumns: {},
  columnData: {},
  tableData: {},
  componentGroups: {},
  groupToEdit: null,
  groupFilters: {},
  groupFiltersEnabled: {},
  selectedFilterOptions: {},
  sortModalOpen: false,
  groupSortConfigs: {},
};

const uiBuilderSlice = createSlice({
  name: 'uiBuilder',
  initialState,
  reducers: {
    setIsInCreateGroupMode: (state, action) => {
      state.isInCreateGroupMode = action.payload;
    },
    setWorkingSelectedComponents: (state, action) => {
      state.workingSelectedComponents = action.payload;
    },
    saveSelectedComponents: (state, action) => {
      const { groupName } = action.payload;
      if (groupName) {
        if (!state.componentGroups[groupName]) {
          state.componentGroups[groupName] = {
            components: state.workingSelectedComponents,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          };
          state.groupFiltersEnabled[groupName] = false;
        } else {
          state.componentGroups[groupName].components =
            state.workingSelectedComponents;
        }
      }
    },
    updateComponentGroups: (state, action) => {
      state.componentGroups = action.payload;
    },
    checkAndDeleteEmptyGroups: (state) => {
      Object.keys(state.componentGroups).forEach((groupName) => {
        if (state.componentGroups[groupName].components.length === 0) {
          delete state.componentGroups[groupName];
          delete state.groupFiltersEnabled[groupName];
        }
      });
    },
    setTableColumns: (state, action) => {
      const { componentId, columns } = action.payload;
      state.tableColumns[componentId] = columns;
    },
    setColumnData: (state, action) => {
      const { componentId, data } = action.payload;
      state.columnData[componentId] = data;
    },
    setTableData: (state, action) => {
      const { componentId, data } = action.payload;
      state.tableData[componentId] = data;
    },
    setGroupToEdit: (state, action) => {
      state.groupToEdit = action.payload;
    },
    setGroupFilters: (state, action) => {
      const { groupName, filters } = action.payload;
      state.groupFilters[groupName] = filters;
    },
    setGroupFiltersEnabled: (state, action) => {
      const { groupName, enabled } = action.payload;
      state.groupFiltersEnabled[groupName] = enabled;
      if (!enabled) {
        state.selectedFilterOptions[groupName] = {};
      }
    },
    setSelectedFilterOptions: (state, action) => {
      const { groupName, options } = action.payload;
      state.selectedFilterOptions[groupName] = options;
    },
    reloadTableData: (state) => {
      state.tableColumns = { ...state.tableColumns };
      state.columnData = { ...state.columnData };
      state.tableData = { ...state.tableData };
    },
    setSortModalOpen: (state, action) => {
      state.sortModalOpen = action.payload;
    },
    setSortConfig: (state, action) => {
      const { groupName, config } = action.payload;
      state.groupSortConfigs[groupName] = config;
    },
  },
});

export const {
  setIsInCreateGroupMode,
  setWorkingSelectedComponents,
  saveSelectedComponents,
  updateComponentGroups,
  checkAndDeleteEmptyGroups,
  setTableColumns,
  setColumnData,
  setTableData,
  setGroupToEdit,
  setGroupFilters,
  setGroupFiltersEnabled,
  setSelectedFilterOptions,
  reloadTableData,
  setSortModalOpen,
  setSortConfig,
} = uiBuilderSlice.actions;

export default uiBuilderSlice.reducer;
