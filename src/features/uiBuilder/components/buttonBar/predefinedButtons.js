import {
  setGroupFiltersEnabled,
  reloadTableData,
  setSortModalOpen,
  setColumnSelectorModalOpen,
} from '../../../../redux/uiBuilderSlice';
import { exportToExcel } from '../../utils/exportToExcelUtils';

export const PREDEFINED_BUTTONS = [
  {
    type: 'button',
    'text/icon': 'Apply filter',
    label: 'Apply Filter',
    description: 'Applies the current filter settings',
    variant: 'solid',
    dataTestId: 'apply-filter-button',
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
    dataTestId: 'clear-filter-button',
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
    dataTestId: 'export-button',
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
    dataTestId: 'sort-button',
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
    dataTestId: 'column-selector-button',
    onClick: (dispatch, groupName, tableData, componentId) => {
      dispatch(setColumnSelectorModalOpen({ isOpen: true, componentId }));
    },
  },
];
