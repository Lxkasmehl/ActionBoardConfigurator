import { useSelector } from 'react-redux';
import { useMemo } from 'react';

export const useTableColumns = (componentId) => {
  const tableColumns = useSelector((state) => state.uiBuilder.tableColumns);
  const componentGroups = useSelector(
    (state) => state.uiBuilder.componentGroups,
  );

  const componentGroup = useMemo(
    () =>
      Object.values(componentGroups).find((group) =>
        group.components.includes(componentId),
      ),
    [componentGroups, componentId],
  );

  const tableComponentId = useMemo(
    () => componentGroup?.components?.find((id) => tableColumns[id]),
    [componentGroup, tableColumns],
  );

  const getColumnOptions = useMemo(() => {
    return () => {
      if (!tableComponentId) return [];

      return (
        tableColumns[tableComponentId]?.map((column) => ({
          label: column.label,
          value: column.id,
        })) || []
      );
    };
  }, [tableComponentId, tableColumns]);

  return {
    tableComponentId,
    getColumnOptions,
  };
};
