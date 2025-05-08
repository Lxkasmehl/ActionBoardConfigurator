import { useState, useEffect, useCallback } from 'react';
import { useSendRequest } from './useSendRequest';

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

export const useTableData = (columns, initialDummyData) => {
  const [tableData, setTableData] = useState(initialDummyData);
  const [isLoading, setIsLoading] = useState(false);
  const handleSendRequest = useSendRequest();

  const updateTableData = useCallback((newData) => {
    setTableData(newData);
  }, []);

  // Handle direct iframe data
  useEffect(() => {
    const columnsWithData = columns.filter((col) => col.data);
    if (columnsWithData.length === 0) return;

    setTableData((prevData) => {
      const updatedTableData = prevData.map((row, index) => {
        const newRow = { ...row };
        columnsWithData.forEach((column) => {
          if (column.data && column.data[index] !== undefined) {
            newRow[column.label] = column.data[index];
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
        (col) => col.entity && col.property && !col.data,
      );
      if (entityColumns.length === 0) return;

      setIsLoading(true);
      try {
        const results = await Promise.all(
          entityColumns.map((col) => {
            // If we have a nested property, we need to include both the navigation property and the nested property
            if (col.nestedProperty) {
              // Ensure we're not duplicating the navigation path
              const navigationPath = col.nestedNavigationPath || [];
              return handleSendRequest({
                entity: col.entity.name,
                property: col.nestedProperty,
                nestedNavigationPath: navigationPath,
              });
            }
            return handleSendRequest({
              entity: col.entity.name,
              property: col.property,
            });
          }),
        );

        const newEntityData = {};
        results.forEach((result, index) => {
          const column = entityColumns[index];
          if (column.nestedProperty) {
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
            const results = extractNestedValue(result, pathParts);
            newEntityData[column.label] = results;
          } else {
            // For regular properties, just get the property value directly
            newEntityData[column.label] = result.d.results.map(
              (item) => item[column.property.name],
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
  }, [columns, handleSendRequest]);

  return [tableData, updateTableData, isLoading];
};
