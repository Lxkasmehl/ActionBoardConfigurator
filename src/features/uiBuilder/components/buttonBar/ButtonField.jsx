import { Button, IconButton, Autocomplete } from '@mui/joy';
import * as Icons from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

export default function ButtonField({ field, disabled = false, groupName }) {
  const dispatch = useDispatch();
  let IconComponent;
  const commonProps = {
    size: 'sm',
    disabled,
    onClick: () => field.onClick(dispatch, groupName),
    variant: field.variant || 'solid',
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
  }).isRequired,
  disabled: PropTypes.bool,
  groupName: PropTypes.string,
};
