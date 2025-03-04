import { Input, Select, Option } from '@mui/joy';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import {
  COMMON_INPUT_STYLES,
  DATE_PICKER_STYLES,
} from './PropertyTypeInput.constants';

export default function PropertyTypeInput({ propertyType, ...props }) {
  if (!propertyType || typeof propertyType !== 'string') {
    return <Input type='text' sx={COMMON_INPUT_STYLES} {...props} />;
  }

  const typeMatch = propertyType.match(/Edm\.(.*)/);
  const type = (typeMatch ? typeMatch[1] : propertyType).toLowerCase();

  switch (type) {
    case 'datetimeoffset':
    case 'date':
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            name={props.name}
            value={props.value ? dayjs(props.value) : null}
            onChange={props.onChange}
            slotProps={{
              textField: {
                size: 'small',
                sx: DATE_PICKER_STYLES,
              },
            }}
            label={props.placeholder}
          />
        </LocalizationProvider>
      );
    case 'int16':
    case 'int32':
    case 'int64':
    case 'decimal':
    case 'double':
    case 'single':
      return <Input type='number' sx={COMMON_INPUT_STYLES} {...props} />;
    case 'boolean':
      return (
        <Select sx={COMMON_INPUT_STYLES} {...props}>
          <Option value='true'>True</Option>
          <Option value='false'>False</Option>
        </Select>
      );
    default:
      return <Input type='text' sx={COMMON_INPUT_STYLES} {...props} />;
  }
}

PropertyTypeInput.propTypes = {
  propertyType: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
