import { createSelector } from '@reduxjs/toolkit';

export const selectPropertyOptions = createSelector(
  (state) => state.entities.propertyOptions,
  (_, id) => id,
  (propertyOptions, id) => propertyOptions[id] || [],
);
