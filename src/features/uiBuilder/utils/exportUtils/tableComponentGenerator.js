export const generateTableComponent = () => {
  return `import React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';

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

export default function TableComponent({ componentId, columnData, tableColumns }) {
  const appliedFilters = useSelector((state) => state.uiState.appliedFilters[componentId] || {});
  const columns = tableColumns[componentId];
  const data = columnData[componentId];

  const visibleColumns = useSelector((state) => state.uiState.visibleColumns[componentId] || []);

  // Transform the data into rows for DataGrid
  const rows = [];
  if (data && Object.keys(data).length > 0) {
    const rowCount = data[columns[0].label].length;
    for (let i = 0; i < rowCount; i++) {
      const row = {
        id: i,
        ...columns.reduce((acc, column) => {
          acc[column.label] = data[column.label][i];
          return acc;
        }, {})
      };
      
      // Apply filters - now properly handles multiple filters
      const shouldIncludeRow = Object.entries(appliedFilters).every(([columnName, filterValues]) => {
        if (!filterValues || filterValues.length === 0) return true;
        const rowValue = row[columnName];
        return filterValues.some(value => value === rowValue);
      });

      if (shouldIncludeRow) {
        rows.push(row);
      }
    }
  }

  // Filter columns based on visibleColumns
  const visibleColumnIds = new Set(visibleColumns);
  const filteredColumns = columns.filter(column => visibleColumnIds.has(column.id));

  // If no visible columns are selected, show all columns
  const columnsToUse = filteredColumns.length > 0 ? filteredColumns : columns;

  // Transform columns for DataGrid
  const gridColumns = columnsToUse.map(column => ({
    field: column.label,
    headerName: column.label,
    editable: false,
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
    filterable: true,
  }));
  
  return (
    <ThemeProvider theme={theme}>
      <div style={{ height: 500, width: '100%', overflow: 'auto' }}>
        <DataGridPro
          rows={rows}
          columns={gridColumns}
          disableRowSelectionOnClick
          columnReordering={false}
          experimentalFeatures={{ newEditingApi: true }}
          hideFooter
        />
      </div>
    </ThemeProvider>
  );
}`;
};
