import { useState } from 'react';
import {
  Input,
  Select,
  Option,
  Chip,
  IconButton,
  Box,
  ChipDelete,
} from '@mui/joy';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import AddIcon from '@mui/icons-material/Add';
import {
  COMMON_INPUT_STYLES,
  DATE_PICKER_STYLES,
} from './PropertyTypeInput.constants';

export default function PropertyTypeInput({
  propertyType,
  operator,
  ...props
}) {
  const [inputValue, setInputValue] = useState('');
  const [values, setValues] = useState(() => {
    return props.value ? props.value.split(',').filter(Boolean) : [];
  });

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newValues = [...values, inputValue.trim()];
      setValues(newValues);
      setInputValue('');
      props.onChange(newValues.join(','));
    }
  };

  const handleAddClick = () => {
    if (inputValue.trim()) {
      const newValues = [...values, inputValue.trim()];
      setValues(newValues);
      setInputValue('');
      props.onChange(newValues.join(','));
    }
  };

  const handleDelete = (valueToDelete) => {
    const newValues = values.filter((value) => value !== valueToDelete);
    setValues(newValues);
    props.onChange(newValues.join(','));
  };

  if (operator === 'IN') {
    return (
      <Box>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder='Type and press Enter'
          sx={{ flex: 1, borderRadius: 0, width: 230 }}
          endDecorator={
            <IconButton onClick={handleAddClick} sx={{ alignSelf: 'center' }}>
              <AddIcon />
            </IconButton>
          }
          startDecorator={
            values.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  paddingTop: 0.5,
                  paddingBottom: 0.5,
                  maxWidth: 120,
                }}
              >
                {values.map((value, index) => (
                  <Chip
                    size='sm'
                    key={index}
                    variant='soft'
                    endDecorator={
                      <ChipDelete
                        onDelete={() => {
                          handleDelete(value);
                        }}
                      />
                    }
                  >
                    {value}
                  </Chip>
                ))}
              </Box>
            )
          }
        />
        <input type='hidden' name={props.name} value={values.join(',')} />
      </Box>
    );
  }

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
  operator: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
