import { useState, useEffect, useCallback } from 'react';
import { useSendRequest } from './useSendRequest';

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
          entityColumns.map((col) =>
            handleSendRequest({
              entity: col.entity.name,
              property: col.property.name,
            }),
          ),
        );

        const newEntityData = {};
        results.forEach((result, index) => {
          const column = entityColumns[index];
          newEntityData[column.label] = result.d.results.map(
            (item) => item[column.property.name],
          );
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
