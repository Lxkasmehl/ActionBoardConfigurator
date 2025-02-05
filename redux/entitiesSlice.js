import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  relevantEntities: [],
  selectedEntities: [],
};

const entitiesSlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    setEntities: (state, action) => {
      state.relevantEntities = action.payload;
    },
    toggleEntitySelection: (state, action) => {
      const entity = action.payload;
      if (state.selectedEntities.includes(entity)) {
        state.selectedEntities = state.selectedEntities.filter(
          (item) => item !== entity
        );
      } else {
        state.selectedEntities.push(entity);
      }
    },
  },
});

export const { setEntities, toggleEntitySelection } = entitiesSlice.actions;
export default entitiesSlice.reducer;
