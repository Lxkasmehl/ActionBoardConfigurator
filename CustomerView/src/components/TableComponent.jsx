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
    (state) => state.data.columnData[component.id] || {}
  );
  const tableData = useSelector(
    (state) => state.data.tableData[component.id] || []
  );
  const tableColumns = useSelector(
    (state) => state.data.tableColumns[component.id] || []
  );
  const tableConfigEntries = useSelector(
    (state) => state.data.tableConfigEntries[component.id] || {}
  );
  const currentVisibleColumns = useSelector(
    (state) =>
      state.uiState.visibleColumns[component.id] ||
      tableColumns.map((col) => col.id)
  );
  const appliedFilters = useSelector(
    (state) => state.uiState.appliedFilters[component.id] || {}
  );

  // Use the column IDs from tableColumns directly if available, otherwise fall back to currentVisibleColumns
  const effectiveVisibleColumns =
    tableColumns && Array.isArray(tableColumns) && tableColumns.length > 0
      ? tableColumns.map((col) => col.id)
      : currentVisibleColumns;

  // Use tableColumns from Redux store instead of component.props.columns
  const actualColumns = tableColumns.length > 0 ? tableColumns : columns;

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

    // Filter based on visible columns if they exist
    if (effectiveVisibleColumns && effectiveVisibleColumns.length > 0) {
      return gridColumns.filter((col) =>
        effectiveVisibleColumns.includes(col.columnId)
      );
    }

    return gridColumns;
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
                  }
                );

                // Compare arrays by checking if any selected value matches any row value
                matches = actualSelectedValues.some((selectedValue) =>
                  rowValue.some((rowVal) =>
                    Array.isArray(selectedValue) && Array.isArray(rowVal)
                      ? selectedValue.length === rowVal.length &&
                        selectedValue.every((val, i) => val === rowVal[i])
                      : selectedValue === rowVal
                  )
                );
              } else {
                matches = selectedValues.includes(rowValue);
              }

              return matches;
            }
          );
        });
      }

      setData(initialData);
    } else {
      setData([]);
    }
  }, [tableData, actualColumns, component.id, appliedFilters]);

  const handleSortModelChange = (newSortModel) => {
    setSortModel(newSortModel);
  };

  const handleFilterModelChange = (newFilterModel) => {
    setFilterModel(newFilterModel);
  };

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
    <Box sx={{ marginBottom: 2 }}>
      <ThemeProvider theme={theme}>
        <div style={{ height: 500, width: '100%', overflow: 'auto' }}>
          <DataGridPro
            rows={data}
            columns={displayColumns}
            loading={loading}
            disableRowSelectionOnClick
            disableColumnReorder={true}
            experimentalFeatures={{ newEditingApi: true }}
            hideFooter
            disableColumnSorting
            disableColumnMenu
          />
        </div>
      </ThemeProvider>
    </Box>
  );
}
