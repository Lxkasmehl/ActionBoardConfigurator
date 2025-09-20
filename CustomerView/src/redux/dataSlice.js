import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  components: [],
  columnData: {},
  tableColumns: {},
  componentGroups: [],
  tableData: {},
  visibleColumns: {},
  tableConfigEntries: {},
  appConfig: null,
  loading: false,
  error: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setAppConfig: (state, action) => {
      const config = action.payload;

      if (config === null || config === undefined) {
        // Reset to initial state when no config
        state.components = [];
        state.columnData = {};
        state.tableColumns = {};
        state.componentGroups = [];
        state.tableData = {};
        state.visibleColumns = {};
        state.tableConfigEntries = {};
        state.appConfig = null;
        return;
      }

      state.components = config.components || [];
      state.columnData = config.columnData || {};
      state.tableColumns = config.tableColumns || {};
      state.componentGroups = config.componentGroups || [];
      state.tableData = config.tableData || {};
      state.visibleColumns = config.visibleColumns || {};
      state.tableConfigEntries = config.tableConfigEntries || {};
      state.appConfig = config;
    },
    updateTableData: (state, action) => {
      const { componentId, data } = action.payload;
      state.tableData[componentId] = data;
    },
    updateVisibleColumns: (state, action) => {
      const { componentId, columns } = action.payload;
      state.visibleColumns[componentId] = columns;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setAppConfig,
  updateTableData,
  updateVisibleColumns,
  setLoading,
  setError,
} = dataSlice.actions;
export default dataSlice.reducer;
