import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Autocomplete,
  Menu,
  MenuItem,
  Dropdown,
  MenuButton,
} from '@mui/joy';
import * as Icons from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  applyFilters,
  clearFilters,
  setSortModalOpen,
  setColumnSelectorModalOpen,
} from '../redux/uiStateSlice';
import { exportToExcel } from '../utils/exportToExcelUtils';
import SortModal from './SortModal';
import ColumnSelectorModal from './ColumnSelectorModal';

export default function ButtonBar({
  component,
  onButtonClick,
  fields,
  componentId,
  componentGroups,
  tableColumns,
  tableData,
}) {
  const dispatch = useDispatch();
  const [isColumnSelectorModalOpen, setIsColumnSelectorModalOpen] =
    useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  // Support both old structure (buttons) and new structure (fields)
  const { props } = component || {};
  const { buttons = [], orientation = 'horizontal' } = props || {};

  // Use fields if available (from AdminView export), otherwise fall back to buttons
  const fieldsToRender = fields || buttons;

  // Get component group and table component
  const componentGroup = Object.values(componentGroups || {}).find((group) =>
    group.components.includes(componentId)
  );

  const tableComponentId = componentGroup?.components?.find(
    (id) => tableColumns?.[id]
  );

  const columnOptions =
    tableColumns?.[tableComponentId]?.map((column) => ({
      label: column.label,
      value: column.id,
    })) || [];

  const visibleColumns = useSelector(
    (state) => state.uiState.visibleColumns[tableComponentId] || []
  );

  const handleButtonClick = (field, item) => {
    // Use field.label for the switch case (AdminView structure)
    const buttonLabel = field.label || field['text/icon'];

    switch (buttonLabel) {
      case 'Apply Filter':
        dispatch(applyFilters({ tableComponentId }));
        break;
      case 'Clear Filters':
        dispatch(clearFilters({ tableComponentId }));
        break;
      case 'Sort':
        setIsSortModalOpen(true);
        break;
      case 'Column Selector':
        setIsColumnSelectorModalOpen(true);
        break;
      case 'Export':
        if (item?.label === 'All columns') {
          exportToExcel(
            tableData?.[tableComponentId],
            null,
            null,
            'table_export.xlsx'
          );
        } else if (item?.label === 'Only visible columns') {
          exportToExcel(
            tableData?.[tableComponentId],
            visibleColumns,
            tableColumns?.[tableComponentId],
            'table_export_visible_columns.xlsx'
          );
        }
        break;
      default:
        onButtonClick?.(field);
    }
  };

  const handleApplySort = (field, direction) => {
    // This would be implemented based on your sorting logic
    console.log('Applying sort:', field, direction);
  };

  // If we have fields (AdminView structure), render the advanced ButtonBar
  if (fields) {
    return (
      <Box sx={{ marginBottom: 2 }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {fields.map((field, index) => {
            const commonProps = {
              size: 'sm',
              variant: field.variant || 'solid',
              color: field.color || 'primary',
            };

            const renderField = () => {
              switch (field.type) {
                case 'iconButton':
                  const IconComponent = Icons[field['text/icon']];
                  return (
                    <div key={index}>
                      <IconButton
                        {...commonProps}
                        color='primary'
                        onClick={() => handleButtonClick(field)}
                      >
                        <IconComponent />
                      </IconButton>
                    </div>
                  );
                case 'autocomplete':
                  return (
                    <div key={index}>
                      <Autocomplete
                        {...commonProps}
                        placeholder={field['text/icon']}
                        options={[]}
                        sx={{
                          width: '170px',
                        }}
                      />
                    </div>
                  );
                case 'menu':
                  return (
                    <div key={index}>
                      <Dropdown>
                        <MenuButton {...commonProps}>
                          {field['text/icon']}
                        </MenuButton>
                        <Menu>
                          {field.menuItems?.map((item, itemIndex) => (
                            <MenuItem
                              {...commonProps}
                              color='neutral'
                              key={itemIndex}
                              onClick={() => handleButtonClick(field, item)}
                            >
                              {item.label}
                            </MenuItem>
                          ))}
                        </Menu>
                      </Dropdown>
                    </div>
                  );
                case 'button':
                default:
                  return (
                    <div key={index}>
                      <Button
                        {...commonProps}
                        onClick={() => handleButtonClick(field)}
                      >
                        {field['text/icon']}
                      </Button>
                    </div>
                  );
              }
            };

            return renderField();
          })}
        </div>

        {/* Modals */}
        <SortModal
          open={isSortModalOpen}
          onClose={() => setIsSortModalOpen(false)}
          columnOptions={columnOptions}
          tableComponentId={tableComponentId}
          onApplySort={handleApplySort}
        />
        <ColumnSelectorModal
          open={isColumnSelectorModalOpen}
          onClose={() => setIsColumnSelectorModalOpen(false)}
          componentId={componentId}
          columnOptions={columnOptions}
          tableComponentId={tableComponentId}
        />
      </Box>
    );
  }

  // Fallback to original ButtonGroup structure for backward compatibility
  return (
    <Box sx={{ marginBottom: 2 }}>
      <ButtonGroup
        orientation={orientation}
        variant='outlined'
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        {buttons.map((button, index) => (
          <Button
            key={button.id || index}
            variant={button.variant || 'outlined'}
            color={button.color || 'primary'}
            size={button.size || 'md'}
            onClick={() => handleButtonClick(button)}
            disabled={button.disabled}
            startDecorator={button.startIcon}
            endDecorator={button.endIcon}
          >
            {button.label || `Button ${index + 1}`}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
}
