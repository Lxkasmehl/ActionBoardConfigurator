import { useState, useEffect } from 'react';
import { useSendRequest } from './useSendRequest';

export const useTableData = (columns, initialDummyData) => {
  const [tableData, setTableData] = useState(initialDummyData);
  const handleSendRequest = useSendRequest();

  useEffect(() => {
    const fetchEntityData = async () => {
      const entityColumns = columns.filter((col) => col.entity && col.property);
      if (entityColumns.length === 0) return;

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
          newEntityData[column.label] = result.d.results
            .map((item) => item[column.property.name])
            .filter((value) => value !== null);
        });

        const maxRows = Math.max(
          tableData.length,
          ...Object.values(newEntityData).map((data) => data.length),
        );

        const updatedTableData = Array.from({ length: maxRows }, (_, index) => {
          const newRow =
            index < tableData.length ? { ...tableData[index] } : {};

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

        setTableData(updatedTableData);
      } catch (error) {
        console.error('Error fetching entity data:', error);
      }
    };

    fetchEntityData();
  }, [columns, handleSendRequest, tableData]);

  return [tableData, setTableData];
};
