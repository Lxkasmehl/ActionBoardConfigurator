export const generateButtonBar = () => {
  return `import React from 'react';
import {
  Button,
  IconButton,
  Autocomplete,
  Menu,
  MenuItem,
  Dropdown,
  MenuButton,
} from '@mui/joy';
import * as Icons from '@mui/icons-material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { applyFilters, clearFilters } from '../redux/uiStateSlice';
import { exportToExcel } from '../utils/exportToExcelUtils';
import { useSelector } from 'react-redux';
import ColumnSelectorModal from './ColumnSelectorModal';
import SortModal from './SortModal';

export default function ButtonBar({ fields, componentId, componentGroups, tableColumns, tableData }) {
  const [isColumnSelectorModalOpen, setIsColumnSelectorModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
const dispatch = useDispatch();
  let IconComponent;

  const componentGroup = Object.values(componentGroups).find((group) =>
    group.components.includes(componentId),
  );

  const tableComponentId = componentGroup?.components?.find(
    (id) => tableColumns[id],
  );

  const columnOptions = tableColumns[tableComponentId]?.map((column) => ({
        label: column.label,
        value: column.id,
      })) || [];

  const visibleColumns = useSelector((state) => state.uiState.visibleColumns[tableComponentId] || []);

  const handleButtonClick = (field, item) => {
    switch (field.label) {
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
          exportToExcel(tableData[tableComponentId], null, null, 'table_export.xlsx');
        } else if (item?.label === 'Only visible columns') {
          exportToExcel(tableData[tableComponentId], visibleColumns, tableColumns[tableComponentId], 'table_export_visible_columns.xlsx');
        }
        break;
      default:
        if (field.onClick) {
          field.onClick();
        }
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {fields.map((field, index) => {
          const commonProps = {
            size: 'sm',
            variant: field.variant || 'solid',
            color: field.color || 'primary',
          };

          const renderField = () => {
            switch (field.type) {
              case 'iconButton':
                IconComponent = Icons[field['text/icon']];
                return (
                  <div>
                    <IconButton {...commonProps} color='primary' 
                    onClick={() => handleButtonClick(field)}>
                      <IconComponent />
                    </IconButton>
                  </div>
                );
              case 'autocomplete':
                return (
                  <div>
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
                  <div>
                    <Dropdown>
                      <MenuButton {...commonProps}>{field['text/icon']}</MenuButton>
                      <Menu>
                        {field.menuItems?.map((item, index) => (
                          <MenuItem
                            {...commonProps}
                            color='neutral'
                            key={index}
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
                  <div>
                    <Button {...commonProps} 
                    onClick={() => handleButtonClick(field)}>
                      {field['text/icon']}
                    </Button>
                  </div>
                );
            }
          };

          return renderField();
        })}
      </div>
      <ColumnSelectorModal 
        open={isColumnSelectorModalOpen} 
        onClose={() => setIsColumnSelectorModalOpen(false)} 
        componentId={componentId} 
        columnOptions={columnOptions}
        tableComponentId={tableComponentId}
      />
      <SortModal
        open={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        columnOptions={columnOptions}
        tableComponentId={tableComponentId}
      />
    </>
  );
}`;
};
