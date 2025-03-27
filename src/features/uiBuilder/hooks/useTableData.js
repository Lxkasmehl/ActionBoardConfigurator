import { useState, useEffect } from 'react';
import { useSendRequest } from './useSendRequest';

export const useTableData = (columns, initialDummyData) => {
  const [dummyData, setDummyData] = useState(initialDummyData);
  const handleSendRequest = useSendRequest();

  useEffect(() => {
    const fetchEntityData = async () => {
      const entityColumns = columns.filter(
        (col) => col.type === 'entity' && col.entity && col.property,
      );
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
          dummyData.length,
          ...Object.values(newEntityData).map((data) => data.length),
        );

        const updatedDummyData = Array.from({ length: maxRows }, (_, index) => {
          const newRow =
            index < dummyData.length ? { ...dummyData[index] } : {};

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

        setDummyData(updatedDummyData);
      } catch (error) {
        console.error('Error fetching entity data:', error);
      }
    };

    fetchEntityData();
  }, [columns, handleSendRequest, dummyData]);

  return [dummyData, setDummyData];
};
