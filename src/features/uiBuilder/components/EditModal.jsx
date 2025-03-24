import { useState } from 'react';
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
  Input,
  Autocomplete,
} from '@mui/joy';
import * as Icons from '@mui/icons-material';

export default function EditModal({
  open,
  onClose,
  item,
  onSave,
  onDelete,
  type,
  title,
}) {
  const [editedItem, setEditedItem] = useState(item);
  const [inputValue, setInputValue] = useState('');

  const iconOptions = Object.keys(Icons);

  const filterOptions = (options, { inputValue }) => {
    if (!inputValue) return options.slice(0, 50);
    return options
      .filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase()),
      )
      .slice(0, 50);
  };

  const handleSave = () => {
    onSave(editedItem);
    onClose();
  };

  const handleDelete = () => {
    onDelete(type === 'column' ? item.label : item.id);
    onClose();
  };

  const renderFormFields = () => {
    if (type === 'column') {
      return (
        <>
          <FormControl>
            <FormLabel>Label</FormLabel>
            <Input
              value={editedItem.label}
              onChange={(e) =>
                setEditedItem({ ...editedItem, label: e.target.value })
              }
              placeholder='Enter column label'
            />
          </FormControl>
          <FormControl>
            <FormLabel>Type</FormLabel>
            <Select
              value={editedItem.type}
              onChange={(_, value) =>
                setEditedItem({ ...editedItem, type: value })
              }
              sx={{ minWidth: 200 }}
            >
              <Option value='text'>Text</Option>
              <Option value='number'>Number</Option>
              <Option value='date'>Date</Option>
              <Option value='boolean'>Boolean</Option>
            </Select>
          </FormControl>
        </>
      );
    }

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
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose onClick={onClose} />
        <Typography level='h4'>{title}</Typography>
        {renderFormFields()}
        <div className='flex flex-col gap-4 mt-3'>
          <Button
            variant='outlined'
            color='danger'
            onClick={handleDelete}
            className='w-full'
          >
            Delete {type === 'column' ? 'Column' : 'Field'}
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

EditModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.string,
    type: PropTypes.string.isRequired,
    'text/icon': PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['column', 'field']).isRequired,
  title: PropTypes.string.isRequired,
};
