import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalDialog, ModalClose, Typography, Button } from '@mui/joy';
import ColumnFormFields from './ColumnFormFields';
import FieldFormFields from './FieldFormFields';

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

  const handleSave = useCallback(() => {
    onSave(editedItem);
    onClose();
  }, [editedItem, onSave, onClose]);

  const handleDelete = useCallback(() => {
    onDelete(type === 'column' ? item.label : item.id);
    onClose();
  }, [type, item, onDelete, onClose]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose onClick={onClose} />
        <Typography level='h4'>{title}</Typography>
        {type === 'column' ? (
          <ColumnFormFields
            editedItem={editedItem}
            setEditedItem={setEditedItem}
          />
        ) : (
          <FieldFormFields
            editedItem={editedItem}
            setEditedItem={setEditedItem}
            inputValue={inputValue}
            setInputValue={setInputValue}
          />
        )}
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
    entity: PropTypes.shape({
      name: PropTypes.string,
      properties: PropTypes.object,
    }),
    property: PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string,
    }),
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['column', 'field']).isRequired,
  title: PropTypes.string.isRequired,
};
