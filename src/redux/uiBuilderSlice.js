import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isInCreateGroupMode: false,
  workingSelectedComponents: [],
  tableColumns: {},
  columnData: {},
  componentGroups: {},
  groupToEdit: null,
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
        } else {
          state.componentGroups[groupName].components =
            state.workingSelectedComponents;
        }
      }
    },
    setTableColumns: (state, action) => {
      const { componentId, columns } = action.payload;
      state.tableColumns[componentId] = columns;
    },
    setColumnData: (state, action) => {
      const { componentId, data } = action.payload;
      state.columnData[componentId] = data;
    },
    setGroupToEdit: (state, action) => {
      state.groupToEdit = action.payload;
    },
  },
});

export const {
  setIsInCreateGroupMode,
  setWorkingSelectedComponents,
  saveSelectedComponents,
  setTableColumns,
  setColumnData,
  setGroupToEdit,
} = uiBuilderSlice.actions;

export default uiBuilderSlice.reducer;
