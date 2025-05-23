import { useState, useEffect, useCallback } from 'react';
import { useSendRequest } from './useSendRequest';
import { useSelector } from 'react-redux';

// Helper function to format date values
const formatDateValue = (value) => {
  if (
    typeof value === 'string' &&
    value.startsWith('/Date(') &&
    value.endsWith(')/')
  ) {
    const timestamp = parseInt(value.replace(/[^-\d]/g, ''));
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
  return value;
};

// Helper function to extract values from nested OData responses
export const extractNestedValue = (obj, propertyPath) => {
  if (!obj) return null;

  // If the property path is a string, split it by dots
  const path =
    typeof propertyPath === 'string' ? propertyPath.split('.') : propertyPath;

  // Get the current property name
  const currentProp = path[0];

  // If we've reached the end of the path, return the value
  if (path.length === 1) {
    // Handle results array if present
    if (obj[currentProp]?.results) {
      return obj[currentProp].results;
    }
    return obj[currentProp];
  }

  // If the current property has a results array, process each item
  if (obj[currentProp]?.results) {
    return obj[currentProp].results.map((item) =>
      extractNestedValue(item, path.slice(1)),
    );
  }

  // Otherwise, continue traversing
  return extractNestedValue(obj[currentProp], path.slice(1));
};

export const useTableData = (columns, initialDummyData, componentId) => {
  const [tableData, setTableData] = useState(initialDummyData);
  const [isLoading, setIsLoading] = useState(false);
  const handleSendRequest = useSendRequest();
  const columnSeparators = useSelector(
    (state) => state.uiBuilder.columnSeparators[componentId] || {},
  );

  const updateTableData = useCallback((newData) => {
    setTableData(newData);
  }, []);

  // Handle direct iframe data
  useEffect(() => {
    const columnsWithData = columns.filter((col) => col.data);
    if (columnsWithData.length === 0) return;

    const extractValueFromNestedResults = (obj) => {
      if (!obj) return null;

      // If we have a results array, take the first item
      if (obj.results) {
        const firstResult = Array.isArray(obj.results)
          ? obj.results[0]
          : obj.results;
        return extractValueFromNestedResults(firstResult);
      }

      // If it's an object but not a results array, look for the first non-metadata property
      if (typeof obj === 'object') {
        const firstValue = Object.entries(obj).find(
          ([key]) => key !== '__metadata',
        )?.[1];
        if (firstValue) {
          return extractValueFromNestedResults(firstValue);
        }
      }

      // If we've reached a primitive value, return it
      return obj;
    };

    setTableData((prevData) => {
      const updatedTableData = prevData.map((row, index) => {
        const newRow = { ...row };
        columnsWithData.forEach((column) => {
          if (column.data && column.data[index] !== undefined) {
            const value = column.data[index];
            if (value && typeof value === 'object') {
              const extractedValue = extractValueFromNestedResults(value);
              newRow[column.label] = formatDateValue(extractedValue);
            } else {
              newRow[column.label] = formatDateValue(value);
            }
          }
        });
        return newRow;
      });
      return updatedTableData;
    });
  }, [columns]);

  // Handle entity/property data
  useEffect(() => {
    const fetchEntityData = async () => {
      const entityColumns = columns.filter(
        (col) =>
          col.entity && (col.property || col.combinedProperties) && !col.data,
      );
      if (entityColumns.length === 0) return;

      setIsLoading(true);
      try {
        const results = await Promise.all(
          entityColumns.flatMap((col) => {
            // Handle combined properties case
            if (col.combinedProperties) {
              return col.combinedProperties.map((property) => {
                // Check if the property has nested properties
                if (property.nestedProperty) {
                  const navigationPath = property.nestedNavigationPath || [];
                  return handleSendRequest({
                    entity: col.entity.name,
                    property: property.nestedProperty,
                    nestedNavigationPath: navigationPath,
                  });
                }
                return handleSendRequest({
                  entity: col.entity.name,
                  property: property,
                });
              });
            }
            // If we have a nested property, we need to include both the navigation property and the nested property
            if (col.nestedProperty) {
              // Ensure we're not duplicating the navigation path
              const navigationPath = col.nestedNavigationPath || [];
              return [
                handleSendRequest({
                  entity: col.entity.name,
                  property: col.nestedProperty,
                  nestedNavigationPath: navigationPath,
                }),
              ];
            }
            return [
              handleSendRequest({
                entity: col.entity.name,
                property: col.property,
              }),
            ];
          }),
        );

        const newEntityData = {};
        let resultIndex = 0;
        entityColumns.forEach((column) => {
          if (column.combinedProperties) {
            // For combined properties, we need to merge the results
            const combinedResults = column.combinedProperties.map(
              (combinedProperty) => {
                const result = results[resultIndex++];
                // Check if the property has nested properties
                if (combinedProperty.nestedProperty) {
                  const navigationPath =
                    combinedProperty.nestedNavigationPath || [];
                  const pathParts = ['d'];

                  // Add navigation path parts
                  navigationPath.forEach((navProp) => {
                    pathParts.push(navProp.name);
                  });

                  // Add the final property name
                  pathParts.push(combinedProperty.nestedProperty.name);

                  // Extract the value using the complete path
                  const nestedResults = extractNestedValue(result, pathParts);
                  return nestedResults.map((value) => formatDateValue(value));
                }
                return result.d.results.map((item) =>
                  formatDateValue(item[combinedProperty.name]),
                );
              },
            );

            // Get the separator for this column
            const separator = columnSeparators[column.id] || '';

            // Combine the results by merging the arrays in the order of combinedProperties
            newEntityData[column.label] = combinedResults.reduce(
              (acc, curr, index) => {
                return acc.map((item, i) => {
                  if (curr[i] !== undefined) {
                    // For the first item, just use the value
                    if (index === 0) {
                      return curr[i];
                    }
                    // For subsequent items, append with separator
                    return item ? `${item}${separator}${curr[i]}` : curr[i];
                  }
                  return item;
                });
              },
              Array(combinedResults[0]?.length || 0).fill(''),
            );
          } else if (column.nestedProperty) {
            // For nested properties, build the complete path to the value
            const navigationPath = column.nestedNavigationPath || [];
            const pathParts = ['d'];

            // Add navigation path parts
            navigationPath.forEach((navProp) => {
              pathParts.push(navProp.name);
            });

            // Add the final property name
            pathParts.push(column.nestedProperty.name);

            // Extract the value using the complete path
            const result = results[resultIndex++];
            const nestedResults = extractNestedValue(result, pathParts);
            newEntityData[column.label] = nestedResults.map((value) =>
              formatDateValue(value),
            );
          } else {
            // For regular properties, just get the property value directly
            const result = results[resultIndex++];
            newEntityData[column.label] = result.d.results.map((item) =>
              formatDateValue(item[column.property.name]),
            );
          }
        });

        setTableData((prevData) => {
          const maxRows = Math.max(
            prevData.length,
            ...Object.values(newEntityData).map((data) => data.length),
          );

          return Array.from({ length: maxRows }, (_, index) => {
            const newRow =
              index < prevData.length ? { ...prevData[index] } : {};

            entityColumns.forEach((column) => {
              if (
                newEntityData[column.label] &&
                newEntityData[column.label][index]
              ) {
                newRow[column.label] = newEntityData[column.label][index];
              }
            });

            return newRow;
          });
        });
      } catch (error) {
        console.error('Error fetching entity data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, handleSendRequest]);

  return [tableData, updateTableData, isLoading];
};
