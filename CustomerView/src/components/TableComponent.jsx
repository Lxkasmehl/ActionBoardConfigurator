import React, { useState, useEffect, useMemo } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/joy';

const theme = createTheme({
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(224, 224, 224, 1)',
        },
        cell: {
          borderRight: '1px solid rgba(224, 224, 224, 1)',
          '&:last-child': {
            borderRight: 'none',
          },
        },
        columnHeaders: {
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
          borderTop: '1px solid rgba(224, 224, 224, 1)',
        },
        columnHeader: {
          borderRight: '1px solid rgba(224, 224, 224, 1)',
          '&:last-child': {
            borderRight: 'none',
          },
        },
        row: {
          '&:last-child .MuiDataGrid-cell': {
            borderBottom: 'none',
          },
        },
      },
    },
  },
});

export default function TableComponent({ component }) {
  const { props } = component;
  const {
    columns = [],
    pageSize = 25,
    enablePagination = true,
    enableSorting = true,
    enableFiltering = true,
    title,
  } = props || {};

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: pageSize,
  });
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });

  // Get data from Redux store
  const columnData = useSelector(
    (state) => state.data.columnData[component.id] || {},
  );
  const tableData = useSelector(
    (state) => state.data.tableData[component.id] || [],
  );
  const reduxTableColumns = useSelector(
    (state) => state.data.tableColumns[component.id] || [],
  );
  const tableConfigEntries = useSelector(
    (state) => state.data.tableConfigEntries[component.id] || {},
  );
  const currentVisibleColumns = useSelector(
    (state) => state.uiState.visibleColumns[component.id] || [],
  );
  const appliedFilters = useSelector(
    (state) => state.uiState.appliedFilters[component.id] || {},
  );
  const appliedSorting = useSelector(
    (state) => state.uiState.appliedSorting[component.id] || null,
  );

  // Use tableColumns from props if available, otherwise from Redux
  const tableColumnsFromProps = component.tableColumns?.[component.id] || [];
  const tableColumns =
    tableColumnsFromProps.length > 0
      ? tableColumnsFromProps
      : reduxTableColumns;

  // Use tableColumns from props/Redux, fallback to component.props.columns
  const actualColumns = tableColumns.length > 0 ? tableColumns : columns;

  // Use visibleColumns from Redux store, but ensure they exist in the current columns
  const effectiveVisibleColumns = useMemo(() => {
    // If no actualColumns, return empty array
    if (!actualColumns || actualColumns.length === 0) {
      return [];
    }

    // If no visible columns are set in Redux, show all columns
    if (!currentVisibleColumns || currentVisibleColumns.length === 0) {
      return actualColumns.map((col) => col.id);
    }

    // Filter visible columns to only include those that exist in the current columns
    const currentColumnIds = actualColumns.map((col) => col.id);
    return currentVisibleColumns.filter((id) => currentColumnIds.includes(id));
  }, [currentVisibleColumns, actualColumns]);

  // Transform columns for DataGrid and filter based on visible columns
  const displayColumns = useMemo(() => {
    const gridColumns = actualColumns.map((column) => ({
      field: column.label,
      headerName: column.label,
      minWidth: 100,
      flex: 1,
      resizable: true,
      sortable: enableSorting,
      filterable: enableFiltering,
      type: column.type || 'string',
      columnId: column.id, // Add column ID for filtering
    }));

    // Filter based on visible columns - if no visible columns set, show all
    if (effectiveVisibleColumns.length === 0) {
      return gridColumns;
    }

    return gridColumns.filter((col) =>
      effectiveVisibleColumns.includes(col.columnId),
    );
  }, [actualColumns, effectiveVisibleColumns, enableSorting, enableFiltering]);

  // Initialize table data from tableData (not columnData)
  useEffect(() => {
    if (tableData && tableData.length > 0 && actualColumns.length > 0) {
      // Use tableData directly - it already contains all rows including empty ones
      let initialData = tableData.map((row, index) => ({
        id: index,
        ...actualColumns.reduce((acc, column) => {
          // Use the data from tableData, fallback to empty string if undefined
          const value = row[column.label];
          acc[column.label] = value !== undefined ? value : '';
          return acc;
        }, {}),
      }));

      // Apply filters if any are applied
      if (appliedFilters && Object.keys(appliedFilters).length > 0) {
        initialData = initialData.filter((row) => {
          return Object.entries(appliedFilters).every(
            ([columnLabel, selectedValues]) => {
              if (!selectedValues || selectedValues.length === 0) {
                return true; // No filter applied for this column
              }

              const rowValue = row[columnLabel];

              // Handle array comparison properly
              let matches = false;
              if (Array.isArray(rowValue) && Array.isArray(selectedValues)) {
                // Extract actual values from selectedValues (they might be objects with item_0 property)
                const actualSelectedValues = selectedValues.map(
                  (selectedValue) => {
                    if (
                      selectedValue &&
                      typeof selectedValue === 'object' &&
                      selectedValue.item_0
                    ) {
                      return selectedValue.item_0;
                    }
                    return selectedValue;
                  },
                );

                // Compare arrays by checking if any selected value matches any row value
                matches = actualSelectedValues.some((selectedValue) =>
                  rowValue.some((rowVal) =>
                    Array.isArray(selectedValue) && Array.isArray(rowVal)
                      ? selectedValue.length === rowVal.length &&
                        selectedValue.every((val, i) => val === rowVal[i])
                      : selectedValue === rowVal,
                  ),
                );
              } else {
                matches = selectedValues.includes(rowValue);
              }

              return matches;
            },
          );
        });
      }

      // Apply sorting if any is applied
      if (appliedSorting && appliedSorting.field) {
        initialData.sort((a, b) => {
          const aValue = a[appliedSorting.field];
          const bValue = b[appliedSorting.field];

          // Handle different data types
          let comparison = 0;
          if (aValue < bValue) {
            comparison = -1;
          } else if (aValue > bValue) {
            comparison = 1;
          }

          // Apply direction
          return appliedSorting.direction === 'desc' ? -comparison : comparison;
        });
      }

      setData(initialData);
    } else {
      setData([]);
    }
  }, [tableData, actualColumns, component.id, appliedFilters, appliedSorting]);

  const handleSortModelChange = (newSortModel) => {
    setSortModel(newSortModel);
  };

  const handleFilterModelChange = (newFilterModel) => {
    setFilterModel(newFilterModel);
  };

  // Update sortModel when appliedSorting changes from Redux
  useEffect(() => {
    if (appliedSorting && appliedSorting.field) {
      setSortModel([
        {
          field: appliedSorting.field,
          sort: appliedSorting.direction,
        },
      ]);
    } else {
      setSortModel([]);
    }
  }, [appliedSorting]);

  // Fallback: If no data from Redux, show a simple table with test data
  if (!actualColumns || actualColumns.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color='warning'>
          Table component requires column configuration
        </Typography>
        <Typography level='body-sm' sx={{ mt: 1 }}>
          Component ID: {component.id}
        </Typography>
        <Typography level='body-sm'>
          Column Data Keys: {Object.keys(columnData).join(', ')}
        </Typography>
        <Typography level='body-sm'>
          Table Columns: {tableColumns.length}
        </Typography>
      </Box>
    );
  }

  // If no data, show empty state
  if (data.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color='warning'>
          No data available for this table
        </Typography>
        <Typography level='body-sm' sx={{ mt: 1 }}>
          Component ID: {component.id}
        </Typography>
        <Typography level='body-sm'>Columns: {actualColumns.length}</Typography>
        <Typography level='body-sm'>
          Data Keys: {Object.keys(columnData).join(', ')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{ marginBottom: 2 }}
      data-testid={`table-component-${component.id}`}
    >
      <ThemeProvider theme={theme}>
        <div
          style={{ height: 500, width: '100%', overflow: 'auto' }}
          data-testid={`table-container-${component.id}`}
        >
          <DataGridPro
            rows={data}
            columns={displayColumns}
            loading={loading}
            disableRowSelectionOnClick
            disableColumnReorder={true}
            experimentalFeatures={{ newEditingApi: true }}
            hideFooter
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            disableColumnMenu
            data-testid={`data-grid-${component.id}`}
          />
        </div>
      </ThemeProvider>
    </Box>
  );
}
