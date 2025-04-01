import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filteredEntities: [],
  allEntities: [],
  associationSets: [],
};

const fetchedDataSlice = createSlice({
  name: 'fetchedData',
  initialState,
  reducers: {
    setFilteredEntities(state, action) {
      state.filteredEntities = action.payload;
    },

    setAllEntities(state, action) {
      state.allEntities = action.payload;
    },

    setAssociationSets(state, action) {
      state.associationSets = action.payload;
    },
  },
});

export const { setFilteredEntities, setAllEntities, setAssociationSets } =
  fetchedDataSlice.actions;

export default fetchedDataSlice.reducer;
