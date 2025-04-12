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

export default function ButtonField({
  field,
  disabled = false,
  groupName,
  componentId,
}) {
  const dispatch = useDispatch();
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

  let IconComponent;
  const commonProps = {
    size: 'sm',
    disabled,
    ...(field.onClick && {
      onClick: () => field.onClick(dispatch, groupName, tableData),
    }),
    variant: field.variant || 'solid',
    color: field.color || 'primary',
  };

  switch (field.type) {
    case 'iconButton':
      IconComponent = Icons[field['text/icon']];
      return (
        <div>
          <IconButton {...commonProps} color='primary'>
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
            onChange={(_, value) => field.onClick(dispatch, groupName, value)}
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
                  onClick={() => item.onClick(dispatch, groupName, tableData)}
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
          <Button {...commonProps}>{field['text/icon']}</Button>
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
