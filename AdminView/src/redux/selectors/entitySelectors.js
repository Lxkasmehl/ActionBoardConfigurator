import { createSelector } from '@reduxjs/toolkit';

export const selectPropertyOptions = createSelector(
  (state) => state.dataPicker.propertyOptions,
  (_, id) => id,
  (propertyOptions, id) => propertyOptions[id] || [],
);
