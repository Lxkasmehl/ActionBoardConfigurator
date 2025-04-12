import { useSelector } from 'react-redux';

export const useTableColumns = (componentId) => {
  const tableColumns = useSelector((state) => state.uiBuilder.tableColumns);
  const componentGroups = useSelector(
    (state) => state.uiBuilder.componentGroups,
  );

  const componentGroup = Object.values(componentGroups).find((group) =>
    group.components.includes(componentId),
  );

  const tableComponentId = componentGroup?.components?.find(
    (id) => tableColumns[id],
  );

  const getColumnOptions = () => {
    if (!tableComponentId) return [];

    return (
      tableColumns[tableComponentId]?.map((column) => ({
        label: column.label,
        value: column.id,
      })) || []
    );
  };

  return {
    tableComponentId,
    getColumnOptions,
  };
};
