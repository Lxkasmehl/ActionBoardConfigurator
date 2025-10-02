/**
 * Restores table data from Firebase format back to original array format
 * Converts objects with col_0, col_1 keys back to arrays
 */
export const restoreTableData = (tableData) => {
  if (!tableData || typeof tableData !== 'object') {
    return tableData;
  }

  const restored = {};
  for (const [key, value] of Object.entries(tableData)) {
    if (Array.isArray(value)) {
      // Check if this array contains objects with col_ keys (converted from nested arrays)
      const hasColKeys = value.some(
        (item) =>
          item &&
          typeof item === 'object' &&
          Object.keys(item).some((k) => k.startsWith('col_'))
      );

      if (hasColKeys) {
        // Convert back to array of arrays
        restored[key] = value.map((row) => {
          if (
            row &&
            typeof row === 'object' &&
            Object.keys(row).some((k) => k.startsWith('col_'))
          ) {
            // Convert object with col_ keys back to array
            const colKeys = Object.keys(row).filter((k) =>
              k.startsWith('col_')
            );
            const maxColIndex = Math.max(
              ...colKeys.map((k) => parseInt(k.replace('col_', '')))
            );

            const array = [];
            for (let i = 0; i <= maxColIndex; i++) {
              array[i] = row[`col_${i}`] || null;
            }
            return array;
          }
          return row;
        });
      } else {
        // Regular array, no conversion needed
        restored[key] = value;
      }
    } else {
      restored[key] = value;
    }
  }

  return restored;
};
