import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  components: [],
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
  sortModalOpen: { isOpen: false, componentId: null },
  groupSortConfigs: {},
  visibleColumns: {},
  columnSelectorModalOpen: { isOpen: false, componentId: null },
  columnOrder: {},
  columnSeparators: {},
  combinedPropertiesMode: {},
  navigationProperties: {},
  textConfigEntries: {},
  tableConfigEntries: {},
};

const uiBuilderSlice = createSlice({
  name: 'uiBuilder',
  initialState,
  reducers: {
    setComponents: (state, action) => {
      state.components = action.payload;
    },
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
      // Initialize visible columns if not already set
      if (!state.visibleColumns[componentId]) {
        state.visibleColumns[componentId] = columns.map((col) => col.id);
      }
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
    setVisibleColumns: (state, action) => {
      const { tableComponentId, columnIds } = action.payload;
      state.visibleColumns[tableComponentId] = columnIds;
    },
    setColumnSelectorModalOpen: (state, action) => {
      state.columnSelectorModalOpen = action.payload;
    },
    setColumnOrder: (state, action) => {
      const { componentId, columnOrder } = action.payload;
      state.columnOrder[componentId] = columnOrder;
    },
    setColumnSeparator: (state, action) => {
      const { componentId, columnId, separator } = action.payload;
      if (!state.columnSeparators[componentId]) {
        state.columnSeparators[componentId] = {};
      }
      state.columnSeparators[componentId][columnId] = separator;
    },
    setCombinedPropertiesMode: (state, action) => {
      const { componentId, columnId, isEnabled } = action.payload;
      if (!state.combinedPropertiesMode[componentId]) {
        state.combinedPropertiesMode[componentId] = {};
      }
      state.combinedPropertiesMode[componentId][columnId] = isEnabled;
    },
    setNavigationProperty: (state, action) => {
      const { componentId, columnId, selectorId, property } = action.payload;
      if (!state.navigationProperties[componentId]) {
        state.navigationProperties[componentId] = {};
      }
      if (!state.navigationProperties[componentId][columnId]) {
        state.navigationProperties[componentId][columnId] = {};
      }
      state.navigationProperties[componentId][columnId][selectorId] = property;
    },
    updateComponentProps: (state, action) => {
      const { componentId, props } = action.payload;
      const componentIndex = state.components.findIndex(
        (c) => c.id === componentId,
      );
      if (componentIndex !== -1) {
        state.components[componentIndex] = {
          ...state.components[componentIndex],
          props: {
            ...state.components[componentIndex].props,
            ...props,
          },
        };
      }
    },
    setTextConfigEntries: (state, action) => {
      const {
        componentId,
        value,
        configEntries,
        selectedProperty,
        selectedValue,
      } = action.payload;
      if (!state.textConfigEntries[componentId]) {
        state.textConfigEntries[componentId] = {};
      }
      state.textConfigEntries[componentId][value] = {
        configEntries,
        selectedProperty,
        selectedValue,
      };
    },
    setTableConfigEntries: (state, action) => {
      const { componentId, columnId, configEntries } = action.payload;
      if (!state.tableConfigEntries[componentId]) {
        state.tableConfigEntries[componentId] = {};
      }
      state.tableConfigEntries[componentId][columnId] = {
        configEntries,
      };
    },
    loadConfigData: (state, action) => {
      const configData = action.payload;
      state.components = configData.components || [];
      state.columnData = configData.columnData || {};
      state.tableColumns = configData.tableColumns || {};
      state.componentGroups = configData.componentGroups || {};
      state.tableData = configData.tableData || {};
      state.visibleColumns = configData.visibleColumns || {};
      state.tableConfigEntries = configData.tableConfigEntries || {};
      state.textConfigEntries = configData.textConfigEntries || {};
    },
  },
});

export const {
  setComponents,
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
  setColumnSelectorModalOpen,
  setVisibleColumns,
  setColumnOrder,
  setColumnSeparator,
  setCombinedPropertiesMode,
  setNavigationProperty,
  updateComponentProps,
  setTextConfigEntries,
  setTableConfigEntries,
  loadConfigData,
} = uiBuilderSlice.actions;

export default uiBuilderSlice.reducer;
