import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Select,
  Option,
  Button,
  Autocomplete,
  Input,
} from '@mui/joy';
import * as Icons from '@mui/icons-material';

export default function EditFieldModal({
  open,
  onClose,
  field,
  onSave,
  onDelete,
}) {
  const [editedField, setEditedField] = useState(field);
  const [inputValue, setInputValue] = useState('');

  const iconOptions = useMemo(() => Object.keys(Icons), []);

  const filterOptions = (options, { inputValue }) => {
    if (!inputValue) return options.slice(0, 50);
    return options
      .filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase()),
      )
      .slice(0, 50);
  };

  const handleSave = () => {
    onSave(editedField);
    onClose();
  };

  const handleDelete = () => {
    onDelete(field.id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose onClick={onClose} />
        <Typography level='h4'>Edit Field</Typography>
        <FormControl>
          <FormLabel>Type</FormLabel>
          <Select
            value={editedField.type}
            onChange={(_, value) =>
              setEditedField({ ...editedField, type: value, 'text/icon': null })
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
          {editedField.type === 'iconButton' ? (
            <Autocomplete
              value={editedField['text/icon']}
              onChange={(_, value) =>
                setEditedField({ ...editedField, 'text/icon': value })
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
              value={editedField['text/icon']}
              onChange={(e) =>
                setEditedField({ ...editedField, 'text/icon': e.target.value })
              }
              className='w-full p-2 border rounded'
            />
          )}
        </FormControl>
        <div className='flex flex-col gap-4 mt-3'>
          <Button
            variant='outlined'
            color='danger'
            onClick={handleDelete}
            className='w-full'
          >
            Delete Field
          </Button>
          <div className='flex justify-end gap-2'>
            <Button variant='plain' color='neutral' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </ModalDialog>
    </Modal>
  );
}

EditFieldModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  field: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    'text/icon': PropTypes.string.isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
