import PropTypes from 'prop-types';
import {
  FormControl,
  FormLabel,
  Select,
  Option,
  Input,
  Autocomplete,
} from '@mui/joy';
import * as Icons from '@mui/icons-material';
import { useMemo, useCallback } from 'react';

export default function FieldFormFields({
  editedItem,
  setEditedItem,
  inputValue,
  setInputValue,
}) {
  const iconOptions = useMemo(() => Object.keys(Icons), []);

  const filterOptions = useCallback((options, { inputValue }) => {
    if (!inputValue) return options.slice(0, 50);
    return options
      .filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase()),
      )
      .slice(0, 50);
  }, []);

  return (
    <>
      <FormControl>
        <FormLabel>Type</FormLabel>
        <Select
          value={editedItem.type}
          onChange={(_, value) =>
            setEditedItem({ ...editedItem, type: value, 'text/icon': null })
          }
          sx={{ minWidth: 200 }}
        >
          <Option value='button'>Button</Option>
          <Option value='iconButton'>Icon Button</Option>
          <Option value='autocomplete'>Autocomplete</Option>
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel>Text/Icon</FormLabel>
        {editedItem.type === 'iconButton' ? (
          <Autocomplete
            value={editedItem['text/icon']}
            onChange={(_, value) =>
              setEditedItem({ ...editedItem, 'text/icon': value })
            }
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => {
              setInputValue(newInputValue);
            }}
            options={iconOptions}
            filterOptions={filterOptions}
            groupBy={(option) => option[0].toUpperCase()}
            isOptionEqualToValue={(option, value) => option === value}
            filterSelectedOptions
            placeholder='Select Icon'
            sx={{ minWidth: 200 }}
          />
        ) : (
          <Input
            type='text'
            value={editedItem['text/icon']}
            onChange={(e) =>
              setEditedItem({ ...editedItem, 'text/icon': e.target.value })
            }
            className='w-full p-2 border rounded'
          />
        )}
      </FormControl>
    </>
  );
}

FieldFormFields.propTypes = {
  editedItem: PropTypes.shape({
    type: PropTypes.string,
    'text/icon': PropTypes.string,
  }).isRequired,
  setEditedItem: PropTypes.func.isRequired,
  inputValue: PropTypes.string.isRequired,
  setInputValue: PropTypes.func.isRequired,
};
