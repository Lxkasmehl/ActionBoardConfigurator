import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  visibleColumns: {},
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

export const { setVisibleColumns, setLoading, setError, clearError } =
  uiStateSlice.actions;
export default uiStateSlice.reducer;
