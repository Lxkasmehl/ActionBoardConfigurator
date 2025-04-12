import {
  setGroupFiltersEnabled,
  reloadTableData,
  setSortModalOpen,
} from '../../../../redux/uiBuilderSlice';

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
    type: 'button',
    'text/icon': 'Export',
    label: 'Export',
    description: 'Export the current table data',
    variant: 'plain',
    onClick: () => console.log('Exporting data...'),
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
    onClick: (dispatch) => {
      dispatch(setSortModalOpen(true));
    },
  },
  {
    type: 'button',
    'text/icon': 'Column Selector',
    label: 'Column Selector',
    description: 'Select columns to display',
    variant: 'plain',
    onClick: () => console.log('Selecting columns...'),
  },
];
