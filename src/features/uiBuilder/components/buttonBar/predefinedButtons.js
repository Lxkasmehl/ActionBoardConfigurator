import {
  setGroupFiltersEnabled,
  reloadTableData,
  setSortModalOpen,
  setColumnSelectorModalOpen,
} from '../../../../redux/uiBuilderSlice';
import * as XLSX from 'xlsx';

const exportToExcel = (tableData, visibleColumns, tableColumns, fileName) => {
  if (!tableData || tableData.length === 0) {
    console.log('No data to export');
    return;
  }

  // Create a map of column IDs to labels
  const columnMap = {};
  if (tableColumns) {
    tableColumns.forEach((column) => {
      columnMap[column.id] = column.label;
    });
  }

  // Filter table data to only include visible columns
  const filteredData = tableData.map((row) => {
    const filteredRow = {};
    if (visibleColumns) {
      visibleColumns.forEach((columnId) => {
        const columnLabel = columnMap[columnId];
        if (columnLabel && row[columnLabel] !== undefined) {
          filteredRow[columnLabel] = row[columnLabel];
        }
      });
    } else {
      // If no visible columns specified, export all columns
      Object.entries(row).forEach(([key, value]) => {
        filteredRow[key] = value;
      });
    }
    return filteredRow;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(filteredData);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  const excelBuffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const PREDEFINED_BUTTONS = [
  {
    type: 'button',
    'text/icon': 'Apply filter',
    label: 'Apply Filter',
    description: 'Applies the current filter settings',
    variant: 'solid',
    onClick: (dispatch, groupName) => {
      dispatch(setGroupFiltersEnabled({ groupName, enabled: true }));
    },
  },
  {
    type: 'button',
    'text/icon': 'Clear all filter',
    label: 'Clear Filters',
    description: 'Clears all applied filters',
    variant: 'solid',
    onClick: (dispatch, groupName) => {
      dispatch(setGroupFiltersEnabled({ groupName, enabled: false }));
    },
  },
  {
    type: 'iconButton',
    'text/icon': 'Settings',
    label: 'Settings',
    description: 'Open settings menu',
    variant: 'solid',
    onClick: () => console.log('Opening settings...'),
  },
  {
    type: 'autocomplete',
    'text/icon': 'Templates',
    label: 'Templates',
    description: 'Select from available templates',
    variant: 'outlined',
    color: 'neutral',
    onClick: () => console.log('Opening templates...'),
  },
  {
    type: 'button',
    'text/icon': 'Batch Process',
    label: 'Batch Process',
    description: 'Process multiple items at once',
    variant: 'solid',
    onClick: () => console.log('Processing items...'),
  },
  {
    type: 'autocomplete',
    'text/icon': 'Action',
    label: 'Action',
    description: 'Select an action to perform',
    variant: 'outlined',
    color: 'neutral',
    onClick: () => console.log('Initiating action...'),
  },
  {
    type: 'button',
    'text/icon': 'Reload Data',
    label: 'Reload Data',
    description: 'Reload the current table data',
    variant: 'solid',
    onClick: (dispatch, groupName) => {
      dispatch(reloadTableData({ groupName }));
    },
  },
  {
    type: 'menu',
    'text/icon': 'Export',
    label: 'Export',
    description: 'Export the current table data',
    variant: 'plain',
    color: 'primary',
    menuItems: [
      {
        label: 'All columns',
        onClick: (dispatch, groupName, tableData) => {
          exportToExcel(tableData, null, null, 'table_export.xlsx');
        },
      },
      {
        label: 'Only visible columns',
        onClick: (
          dispatch,
          groupName,
          tableData,
          componentId,
          visibleColumns,
          tableColumns,
        ) => {
          exportToExcel(
            tableData,
            visibleColumns,
            tableColumns,
            'table_export_visible_columns.xlsx',
          );
        },
      },
    ],
  },
  {
    type: 'button',
    'text/icon': 'Summary',
    label: 'Summary',
    description: 'View the summary of the current table data',
    variant: 'plain',
    onClick: () => console.log('Viewing summary...'),
  },
  {
    type: 'iconButton',
    'text/icon': 'SwapVert',
    label: 'Sort',
    description: 'Sort the current table data',
    variant: 'plain',
    onClick: (dispatch, groupName, tableData, componentId) => {
      dispatch(setSortModalOpen({ isOpen: true, componentId }));
    },
  },
  {
    type: 'button',
    'text/icon': 'Column Selector',
    label: 'Column Selector',
    description: 'Select columns to display',
    variant: 'plain',
    onClick: (dispatch, groupName, tableData, componentId) => {
      dispatch(setColumnSelectorModalOpen({ isOpen: true, componentId }));
    },
  },
];
