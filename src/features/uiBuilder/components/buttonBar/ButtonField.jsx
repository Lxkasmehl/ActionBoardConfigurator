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
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import NoTableDataModal from './NoTableDataModal';
import { useTableColumns } from '../../hooks/useTableColumns';

export default function ButtonField({
  field,
  disabled = false,
  groupName,
  componentId,
}) {
  const dispatch = useDispatch();
  const [isNoTableDataModalOpen, setIsNoTableDataModalOpen] = useState(false);
  const tableData = useSelector((state) => {
    const componentGroups = state.uiBuilder.componentGroups;
    const componentGroup = Object.values(componentGroups).find((group) =>
      group.components.includes(componentId),
    );
    if (!componentGroup) return null;

    const tableComponentId = componentGroup.components.find(
      (id) => state.uiBuilder.tableData[id],
    );
    return tableComponentId
      ? state.uiBuilder.tableData[tableComponentId]
      : null;
  });

  const { tableComponentId } = useTableColumns(componentId);

  const allVisibleColumns = useSelector(
    (state) => state.uiBuilder.visibleColumns || {},
  );
  const allTableColumns = useSelector(
    (state) => state.uiBuilder.tableColumns || {},
  );

  const visibleColumns = allVisibleColumns[tableComponentId] || [];
  const tableColumns = allTableColumns[tableComponentId] || [];

  let IconComponent;
  const commonProps = {
    size: 'sm',
    disabled,
    ...(field.onClick && {
      onClick: () => {
        if (!tableData) {
          setIsNoTableDataModalOpen(true);
          return;
        }
        field.onClick(
          dispatch,
          groupName,
          tableData,
          componentId,
          visibleColumns,
          tableColumns,
        );
      },
    }),
    variant: field.variant || 'solid',
    color: field.color || 'primary',
  };

  const handleMenuItemClick = (item) => {
    if (!tableData) {
      setIsNoTableDataModalOpen(true);
      return;
    }
    item.onClick(
      dispatch,
      groupName,
      tableData,
      componentId,
      visibleColumns,
      tableColumns,
    );
  };

  switch (field.type) {
    case 'iconButton':
      IconComponent = Icons[field['text/icon']];
      return (
        <div>
          <IconButton {...commonProps} color='primary'>
            <IconComponent />
          </IconButton>
          <NoTableDataModal
            open={isNoTableDataModalOpen}
            onClose={() => setIsNoTableDataModalOpen(false)}
          />
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
            onChange={() => {
              if (!tableData) {
                setIsNoTableDataModalOpen(true);
                return;
              }
              field.onClick(dispatch, groupName);
            }}
          />
          <NoTableDataModal
            open={isNoTableDataModalOpen}
            onClose={() => setIsNoTableDataModalOpen(false)}
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
                  onClick={() => handleMenuItemClick(item)}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </Dropdown>
          <NoTableDataModal
            open={isNoTableDataModalOpen}
            onClose={() => setIsNoTableDataModalOpen(false)}
          />
        </div>
      );
    case 'button':
    default:
      return (
        <div>
          <Button {...commonProps}>{field['text/icon']}</Button>
          <NoTableDataModal
            open={isNoTableDataModalOpen}
            onClose={() => setIsNoTableDataModalOpen(false)}
          />
        </div>
      );
  }
}

ButtonField.propTypes = {
  field: PropTypes.shape({
    type: PropTypes.string.isRequired,
    'text/icon': PropTypes.string.isRequired,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(['plain', 'outlined', 'soft', 'solid']),
    color: PropTypes.string,
    menuItems: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
      }),
    ),
  }).isRequired,
  disabled: PropTypes.bool,
  groupName: PropTypes.string,
  componentId: PropTypes.string,
};
