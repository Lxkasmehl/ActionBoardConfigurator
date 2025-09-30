/**
 * Utility function to remove functions and other non-serializable values from objects
 * before saving to Firebase. This prevents "Unsupported field value: a function" errors
 * and "Nested arrays are not supported" errors.
 */
export const cleanDataForFirebase = (obj) => {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    // Check if this array contains nested arrays (which Firebase doesn't support)
    const hasNestedArrays = obj.some((item) => Array.isArray(item));

    if (hasNestedArrays) {
      // Flatten nested arrays or convert to objects with indexed keys
      const flattened = obj.map((item, index) => {
        if (Array.isArray(item)) {
          // Convert nested array to object with indexed keys
          return item.reduce((acc, value, idx) => {
            acc[`item_${idx}`] = cleanDataForFirebase(value);
            return acc;
          }, {});
        }
        return cleanDataForFirebase(item);
      });

      return flattened.filter((item) => item !== null && item !== undefined);
    }

    // Regular array processing
    return obj
      .map(cleanDataForFirebase)
      .filter((item) => item !== null && item !== undefined);
  }

  if (typeof obj === 'object') {
    // Handle Date objects - convert to ISO string
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    // Handle other objects
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip functions
      if (typeof value === 'function') {
        continue;
      }

      // Skip undefined values
      if (value === undefined) {
        continue;
      }

      const cleanedValue = cleanDataForFirebase(value);
      if (cleanedValue !== null && cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }

  // Return primitive values as-is
  return obj;
};

/**
 * Specifically cleans component data to remove functions from DataGrid configurations
 * and other component props that might contain functions
 */
export const cleanComponentData = (components) => {
  if (!Array.isArray(components)) {
    return components;
  }

  return components.map((component) => {
    const cleanedComponent = { ...component };

    // Clean props
    if (component.props) {
      cleanedComponent.props = cleanDataForFirebase(component.props);
    }

    return cleanedComponent;
  });
};

/**
 * Specifically handles table data which might contain nested arrays
 * Converts nested arrays to objects with indexed keys for Firebase compatibility
 */
export const cleanTableData = (tableData) => {
  if (!tableData || typeof tableData !== 'object') {
    return tableData;
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(tableData)) {
    if (Array.isArray(value)) {
      // Check if this is an array of arrays (nested arrays)
      const hasNestedArrays = value.some((item) => Array.isArray(item));

      if (hasNestedArrays) {
        // Convert array of arrays to object with indexed keys
        cleaned[key] = value.map((row, index) => {
          if (Array.isArray(row)) {
            return row.reduce((acc, cell, idx) => {
              acc[`col_${idx}`] = cleanDataForFirebase(cell);
              return acc;
            }, {});
          }
          return cleanDataForFirebase(row);
        });
      } else {
        // Regular array
        cleaned[key] = cleanDataForFirebase(value);
      }
    } else {
      cleaned[key] = cleanDataForFirebase(value);
    }
  }

  return cleaned;
};

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
          Object.keys(item).some((k) => k.startsWith('col_')),
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
              k.startsWith('col_'),
            );
            const maxColIndex = Math.max(
              ...colKeys.map((k) => parseInt(k.replace('col_', ''))),
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
