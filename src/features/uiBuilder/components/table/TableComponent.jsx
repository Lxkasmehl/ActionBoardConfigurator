import { IconButton } from '@mui/joy';
import { Add } from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EditModal from './EditModal';
import PropTypes from 'prop-types';
import { useTableData } from '../../hooks/useTableData';
import { useSendRequest } from '../../hooks/useSendRequest';
import { getInitialDummyData } from '../../utils/tableUtils';
import { DataGridPro } from '@mui/x-data-grid-pro';
import CustomColumnMenu from './CustomColumnMenu';
import CustomToolbar from './CustomToolbar';
import {
  setTableColumns,
  setColumnData,
  setSortModalOpen,
  setTableData as setTableDataRedux,
  setVisibleColumns,
  setColumnOrder,
  updateComponentProps,
  setTableConfigEntries,
} from '../../../../redux/uiBuilderSlice';
import { useConfigDataFetching } from '../../hooks/useConfigDataFetching';

export default function TableComponent({ component, disabled = false }) {
  const dispatch = useDispatch();
  const [columns, setColumns] = useState(
    component.props.columns.map((col) => ({
      ...col,
      id: crypto.randomUUID(),
    })),
  );
  const [mainEntity, setMainEntity] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [tableData, setTableData, isLoading] = useTableData(
    columns,
    getInitialDummyData(),
    component.id,
  );
  const [relationData, setRelationData] = useState({});
  const sendRequest = useSendRequest();
  const groupFilters = useSelector((state) => state.uiBuilder.groupFilters);
  const groupFiltersEnabled = useSelector(
    (state) => state.uiBuilder.groupFiltersEnabled,
  );
  const componentGroups = useSelector(
    (state) => state.uiBuilder.componentGroups,
  );
  const groupSortConfigs = useSelector(
    (state) => state.uiBuilder.groupSortConfigs,
  );
  const visibleColumns = useSelector(
    (state) => state.uiBuilder.visibleColumns[component.id] || [],
  );
  const columnOrder = useSelector(
    (state) => state.uiBuilder.columnOrder[component.id] || [],
  );
  const tableConfigEntries = useSelector(
    (state) => state.uiBuilder.tableConfigEntries[component.id] || {},
  );
  const [shouldSyncWithBackend, setShouldSyncWithBackend] = useState(false);
  const isInitialized = useRef(false);
  const columnSeparators = useSelector(
    (state) => state.uiBuilder.columnSeparators[component.id] || {},
  );

  const componentGroup = Object.values(componentGroups).find((group) =>
    group.components.includes(component.id),
  );

  const groupName = Object.keys(componentGroups).find(
    (key) => componentGroups[key] === componentGroup,
  );

  const groupFiltersForTable = groupFilters[groupName];
  const filtersEnabled = groupFiltersEnabled[groupName] || false;
  const sortConfig = groupSortConfigs[groupName] || {
    field: null,
    direction: 'asc',
  };

  useEffect(() => {
    const fetchRelationData = async () => {
      const newRelationData = {};

      for (const column of columns) {
        if (column.relation && column.entity) {
          try {
            const response = await sendRequest({
              entity: column.entity.name,
              properties: [column.property.name, column.relation.property.Name],
            });
            newRelationData[column.label] = response.d.results;
          } catch (error) {
            console.error(
              `Error fetching relation data for ${column.label}:`,
              error,
            );
          }
        }
      }

      setRelationData(newRelationData);
    };

    fetchRelationData();
  }, [columns, sendRequest]);

  // Update Redux store whenever columns change
  useEffect(() => {
    dispatch(setTableColumns({ componentId: component.id, columns }));
    // Initialize visible columns and column order if not already set
    if (!isInitialized.current) {
      const initialColumnIds = columns.map((col) => col.id);
      dispatch(
        setVisibleColumns({
          componentId: component.id,
          columnIds: initialColumnIds,
        }),
      );
      dispatch(
        setColumnOrder({
          componentId: component.id,
          columnOrder: initialColumnIds,
        }),
      );
      isInitialized.current = true;
    }
  }, [columns, dispatch, component.id]);

  // Update Redux store whenever table data changes
  useEffect(() => {
    // Transform row-based data to column-based data
    const columnBasedData = {};
    columns.forEach((column) => {
      columnBasedData[column.label] = tableData.map((row) => row[column.label]);
    });

    dispatch(
      setColumnData({ componentId: component.id, data: columnBasedData }),
    );
    dispatch(setTableDataRedux({ componentId: component.id, data: tableData }));
  }, [tableData, dispatch, component.id, columns]);

  // Use the new hook for data fetching
  useConfigDataFetching({
    configEntries: tableConfigEntries,
    onDataFetched: (fetchedValues) => {
      setTableData((prevData) => {
        const newData = prevData.map((row, rowIndex) => {
          const newRow = { ...row };
          Object.entries(fetchedValues).forEach(([columnId, values]) => {
            const column = columns.find((col) => col.id === columnId);
            if (column && values[rowIndex]) {
              // Get the config entry for this column
              const configEntry = tableConfigEntries[columnId];
              const configArray = Array.isArray(configEntry.configEntries[0])
                ? configEntry.configEntries[0]
                : configEntry.configEntries;
              const [, config] = configArray;
              const entityName = Object.keys(config)[0];
              const entityConfig = config[entityName];

              // Handle combined properties
              if (entityConfig.selectedProperties.length > 1) {
                const separator = columnSeparators[columnId] || ' ';
                const combinedValue = entityConfig.selectedProperties
                  .map((prop) => {
                    // Handle nested properties
                    if (
                      prop.navigationProperties &&
                      prop.navigationProperties.length > 0
                    ) {
                      let value = values[rowIndex];
                      // Navigate through the object structure
                      for (const navProp of prop.navigationProperties) {
                        if (!value) break;
                        // Handle arrays with results property
                        const navPropName = navProp.name || navProp.Name;
                        if (value[navPropName]?.results) {
                          value = value[navPropName].results[0];
                        } else {
                          value = value[navPropName];
                        }
                      }
                      const propName = prop.name || prop.Name;
                      return value?.[propName] || '';
                    }
                    // Handle regular properties
                    const propName = prop.name || prop.Name;
                    const value = values[rowIndex][propName];
                    return value !== undefined ? value : '';
                  })
                  .filter(Boolean)
                  .join(separator);
                newRow[column.label] = combinedValue;
              } else {
                // Handle single property with potential navigation path
                const prop = entityConfig.selectedProperties[0];
                if (
                  prop.navigationProperties &&
                  prop.navigationProperties.length > 0
                ) {
                  // Navigate through the object to get the nested value
                  let value = values[rowIndex];
                  for (const navProp of prop.navigationProperties) {
                    if (!value) break;
                    // Handle arrays with results property
                    const navPropName = navProp.name || navProp.Name;
                    if (value[navPropName]?.results) {
                      value = value[navPropName].results[0];
                    } else {
                      value = value[navPropName];
                    }
                  }
                  const propName = prop.name || prop.Name;
                  newRow[column.label] = value?.[propName] || '';
                } else {
                  const propName = prop.name || prop.Name;
                  newRow[column.label] = values[rowIndex][propName] || '';
                }
              }
            }
          });
          return newRow;
        });
        return newData;
      });
    },
    deps: [columns, shouldSyncWithBackend],
  });

  const isColumnInvalid = (column) => {
    return (
      column.entity &&
      !column.isMainEntity &&
      mainEntity &&
      column.entity.name !== mainEntity.name &&
      !column.relation?.label.split('->').pop().includes(mainEntity.name)
    );
  };

  const handleAddColumn = () => {
    if (disabled) return;
    const existingNumbers = columns.map((col) => {
      const match = col.label.match(/Column (\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const maxNumber = Math.max(0, ...existingNumbers);

    let newNumber = maxNumber + 1;
    while (columns.some((col) => col.label === `Column ${newNumber}`)) {
      newNumber++;
    }

    const newColumnLabel = `Column ${newNumber}`;
    const newColumn = {
      id: crypto.randomUUID(),
      label: newColumnLabel,
    };

    const updatedColumns = [...columns, newColumn];
    setColumns(updatedColumns);
    dispatch(
      updateComponentProps({
        componentId: component.id,
        props: { columns: updatedColumns },
      }),
    );

    // Update Redux store
    dispatch(
      setTableColumns({ componentId: component.id, columns: updatedColumns }),
    );

    // Add new column to visible columns
    dispatch(
      setVisibleColumns({
        tableComponentId: component.id,
        columnIds: [...visibleColumns, newColumn.id],
      }),
    );

    // Add new column to column order
    dispatch(
      setColumnOrder({
        componentId: component.id,
        columnOrder: [...columnOrder, newColumn.id],
      }),
    );
  };

  const handleEditColumn = (columnId) => {
    if (disabled) return;
    const column = columns.find((col) => col.id === columnId);
    setEditingColumn(column);
  };

  const handleSaveColumn = (editedColumn) => {
    if (disabled) return;
    setShouldSyncWithBackend(false);
    if (editedColumn.isMainEntity) {
      setMainEntity(editedColumn.entity);
      const updatedColumns = columns.map((col) => ({
        ...col,
        isMainEntity: col.id === editedColumn.id,
      }));
      setColumns(updatedColumns);
      dispatch(
        updateComponentProps({
          componentId: component.id,
          props: { columns: updatedColumns },
        }),
      );
    }

    // Check if we have new data or entity configuration
    if (editedColumn.data || editedColumn.entity) {
      const updatedColumns = editedColumn.isNewColumn
        ? [...columns, { ...editedColumn, id: crypto.randomUUID() }]
        : columns.map((col) =>
            col.id === editingColumn.id ? editedColumn : col,
          );

      // Store config entries if we have entity configuration
      if (editedColumn.entity && editedColumn.configEntries) {
        dispatch(
          setTableConfigEntries({
            componentId: component.id,
            columnId: editedColumn.id,
            configEntries: editedColumn.configEntries,
          }),
        );
      }

      // Always update table data when we have new data or entity changes
      if (editedColumn.data) {
        setTableData((prevData) => {
          const maxRows = Math.max(prevData.length, editedColumn.data.length);
          return Array.from({ length: maxRows }, (_, index) => ({
            ...(prevData[index] || {}),
            [editedColumn.label]: editedColumn.data[index] || '',
          }));
        });
      } else if (editedColumn.entity) {
        // If we have entity changes but no data yet, clear the column data
        setTableData((prevData) => {
          return prevData.map((row) => ({
            ...row,
            [editedColumn.label]: '',
          }));
        });
      }

      setColumns(updatedColumns);
      dispatch(
        updateComponentProps({
          componentId: component.id,
          props: { columns: updatedColumns },
        }),
      );

      // Add new column to visible columns
      if (editedColumn.isNewColumn) {
        const newColumnId = updatedColumns[updatedColumns.length - 1].id;
        dispatch(
          setVisibleColumns({
            tableComponentId: component.id,
            columnIds: [...visibleColumns, newColumnId],
          }),
        );
      }
    } else {
      const updatedColumns = columns.map((col) =>
        col.id === editingColumn.id ? editedColumn : col,
      );
      setColumns(updatedColumns);
      dispatch(
        updateComponentProps({
          componentId: component.id,
          props: { columns: updatedColumns },
        }),
      );
    }
    // Enable backend sync after a delay
    setTimeout(() => {
      setShouldSyncWithBackend(true);
    }, 1000);
  };

  const handleDeleteColumn = (columnId) => {
    if (disabled) return;
    const columnToDelete = columns.find((col) => col.id === columnId);
    if (columnToDelete) {
      if (columnToDelete.isMainEntity) {
        setMainEntity(null);
      }
      const updatedColumns = columns.filter((col) => col.id !== columnId);
      setColumns(updatedColumns);
      dispatch(
        updateComponentProps({
          componentId: component.id,
          props: { columns: updatedColumns },
        }),
      );
      setTableData(
        tableData.map((row) => {
          const newRow = { ...row };
          delete newRow[columnToDelete.label];
          return newRow;
        }),
      );
    }
  };

  const gridColumns = columns.map((column) => {
    const isInvalid = isColumnInvalid(column);
    return {
      field: column.label,
      headerName: column.label,
      minWidth: 100,
      flex: 1,
      resizable: !disabled,
      editable: !disabled && !column.data && !column.entity,
      type: column.type || 'string',
      columnId: column.id,
      headerClassName: isInvalid ? 'invalid-column-header' : '',
      cellClassName: isInvalid ? 'invalid-column-cell' : '',
      description: isInvalid
        ? `This column's entity (${column.entity.name}) does not match the main entity (${mainEntity.name}) and has no valid relation to it. Either make it the main entity, choose a different entity, or set up a proper relation to the main entity.`
        : '',
    };
  });

  // Filter columns based on visible columns
  const filteredColumns = gridColumns.filter((column) =>
    visibleColumns.includes(column.columnId),
  );

  // Sort columns based on column order
  const sortedColumns = [...filteredColumns].sort((a, b) => {
    const aIndex = columnOrder.indexOf(a.columnId);
    const bIndex = columnOrder.indexOf(b.columnId);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const rows = tableData.map((row, index) => {
    const alignedRow = { ...row };
    // Ensure all column values are properly aligned
    columns.forEach((column) => {
      if (column.relation) {
        const mainEntityColumn = columns.find((col) => col.isMainEntity);
        if (mainEntityColumn) {
          const mainEntityValue = row[mainEntityColumn.label];
          if (mainEntityValue) {
            // Find the corresponding relation value from the fetched relation data
            const relationItems = relationData[column.label] || [];
            const relationItem = relationItems.find(
              (item) =>
                item[
                  column.relation.property?.Name ||
                    column.relation.currentEntityProperty.Name
                ] === mainEntityValue,
            );

            alignedRow[column.label] =
              relationItem?.[column.property.name] ||
              relationItem?.[column.property.Name] ||
              null;
          } else {
            alignedRow[column.label] = null;
          }
        }
      }
    });
    return {
      id: index,
      ...alignedRow,
    };
  });

  // Apply filters from groupFiltersForTable only when filters are enabled
  const filteredRows = rows.filter((row) => {
    if (
      !filtersEnabled ||
      !groupFiltersForTable ||
      groupFiltersForTable.length === 0
    ) {
      return true;
    }

    return groupFiltersForTable.every((filter) => {
      const columnValue = row[filter.column];
      return filter.selectedOptions.includes(columnValue);
    });
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortConfig.field) return 0;

    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const comparison = aValue < bValue ? -1 : 1;
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  // Pass setSortModalOpen to the button bar
  const buttonProps = {
    setSortModalOpen,
  };

  return (
    <div
      style={{ maxHeight: 500, width: '100%', maxWidth: 'calc(100vw - 460px)' }}
    >
      <DataGridPro
        rows={sortedRows}
        columns={sortedColumns}
        disableRowSelectionOnClick
        experimentalFeatures={{ newEditingApi: true }}
        columnReordering={!disabled}
        onColumnOrderChange={(params) => {
          const { column, targetIndex, oldIndex } = params;
          if (!column || targetIndex === undefined || oldIndex === undefined)
            return;

          // Create a new array with the updated order
          const newColumnOrder = [...columnOrder];
          const columnId = column.columnId;

          // Remove the column from its old position
          newColumnOrder.splice(oldIndex, 1);
          // Insert it at the new position
          newColumnOrder.splice(targetIndex, 0, columnId);

          dispatch(
            setColumnOrder({
              componentId: component.id,
              columnOrder: newColumnOrder,
            }),
          );
        }}
        onColumnHeaderDragEnd={() => {
          // Force a re-render after drag ends
          dispatch({ type: 'FORCE_RERENDER' });
        }}
        hideFooter
        loading={isLoading}
        slots={{
          toolbar: (props) => (
            <CustomToolbar {...props} buttonProps={buttonProps} />
          ),
          columnMenu: (props) => (
            <CustomColumnMenu
              {...props}
              onEditColumn={handleEditColumn}
              onDeleteColumn={handleDeleteColumn}
              disabled={disabled}
            />
          ),
        }}
        sx={{
          '& .MuiDataGrid-cell': {
            borderRight: '1px solid rgba(224, 224, 224, 1)',
          },
          '& .MuiDataGrid-cell:last-child': {
            borderRight: 'none',
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
            borderTop: '1px solid rgba(224, 224, 224, 1)',
          },
          '& .MuiDataGrid-columnHeader': {
            borderRight: '1px solid rgba(224, 224, 224, 1)',
          },
          '& .MuiDataGrid-columnHeader:last-child': {
            borderRight: 'none',
          },
          '& .MuiDataGrid-row:last-child .MuiDataGrid-cell': {
            borderBottom: 'none',
          },
          '& .invalid-column-header': {
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 0, 0, 0.15)',
            },
          },
          '& .invalid-column-cell': {
            backgroundColor: 'rgba(255, 0, 0, 0.05)',
          },
          ...(disabled ? { opacity: 0.7, pointerEvents: 'none' } : {}),
        }}
        slotProps={{
          basePopper: {
            modifiers: [
              {
                name: 'insetFix',
                enabled: true,
                phase: 'afterWrite',
                fn: ({ state }) => {
                  if (state.elements.popper) {
                    state.elements.popper.style.inset = '0 0px auto auto';
                  }
                },
              },
            ],
          },
        }}
      />
      {!disabled && (
        <IconButton
          variant='solid'
          color='primary'
          onClick={handleAddColumn}
          sx={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            borderRadius: '50%',
          }}
        >
          <Add />
        </IconButton>
      )}
      {editingColumn && !disabled && (
        <EditModal
          open={!!editingColumn}
          onClose={() => setEditingColumn(null)}
          item={editingColumn}
          onSave={handleSaveColumn}
          onDelete={handleDeleteColumn}
          type='column'
          title='Edit Column'
          mainEntity={mainEntity}
          component={component}
        />
      )}
    </div>
  );
}

TableComponent.propTypes = {
  component: PropTypes.shape({
    id: PropTypes.string.isRequired,
    props: PropTypes.shape({
      columns: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
        }),
      ).isRequired,
    }).isRequired,
  }).isRequired,
  disabled: PropTypes.bool,
};
