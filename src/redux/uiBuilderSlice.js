import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isInGroupMode: false,
  workingSelectedComponents: [],
  finalSelectedComponents: [],
};

const uiBuilderSlice = createSlice({
  name: 'uiBuilder',
  initialState,
  reducers: {
    setIsInGroupMode: (state, action) => {
      state.isInGroupMode = action.payload;
    },
    setWorkingSelectedComponents: (state, action) => {
      state.workingSelectedComponents = action.payload;
    },
    saveSelectedComponents: (state) => {
      state.finalSelectedComponents = state.workingSelectedComponents;
    },
    clearSelectedComponents: (state) => {
      state.workingSelectedComponents = [];
      state.finalSelectedComponents = [];
    },
  },
});

export const {
  setIsInGroupMode,
  setWorkingSelectedComponents,
  saveSelectedComponents,
  clearSelectedComponents,
} = uiBuilderSlice.actions;

export default uiBuilderSlice.reducer;
