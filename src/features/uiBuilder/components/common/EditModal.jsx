/* eslint-disable react/prop-types */
import { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalDialog, ModalClose, Typography, Button } from '@mui/joy';
import ColumnFormFields from '../table/ColumnFormFields';
import FieldFormFields from '../table/FieldFormFields';

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
  const columnFormRef = useRef(null);
  const [isWaitingForIframeData, setIsWaitingForIframeData] = useState(false);
  const [isIFrame, setIsIFrame] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'IFRAME_DATA_RESPONSE') {
        if (isWaitingForIframeData) {
          // Extract the actual values from the response
          console.log('event.data.payload', event.data.payload);
          const extractedData = event.data.payload
            .map((item) => {
              if (item.d && item.d.results) {
                return item.d.results.map((result) => result.description);
              }
              return [];
            })
            .flat();

          const entityName =
            event.data.payload[0].d.results[0].__metadata.type.split('.')[1];
          const propertyName = Object.keys(
            event.data.payload[0].d.results[0],
          ).find((key) => key !== '__metadata');

          // If we have entity and property data, merge it with the iframe data
          if (editedItem.entity && editedItem.property) {
            onSave({
              ...editedItem,
              data: extractedData,
              label: `${editedItem.entity.name} -> ${editedItem.property.name}`,
            });
          } else {
            // If we only have direct iframe data, use it as is and update the label
            onSave({
              ...editedItem,
              data: extractedData,
              label: `${entityName} -> ${propertyName}`,
            });
          }
          onClose();
          setIsWaitingForIframeData(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [editedItem, isWaitingForIframeData, onSave, onClose]);

  const handleSave = useCallback(() => {
    if (type === 'column' && columnFormRef.current && isIFrame) {
      setIsWaitingForIframeData(true);
      columnFormRef.current.triggerIframeDataFetch();
    } else {
      onSave(editedItem);
      onClose();
    }
  }, [editedItem, onSave, onClose, type, isIFrame]);

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
            ref={columnFormRef}
            editedItem={editedItem}
            setEditedItem={setEditedItem}
            isIFrame={isIFrame}
            setIsIFrame={setIsIFrame}
            setIsWaitingForIframeData={setIsWaitingForIframeData}
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
            <Button onClick={handleSave} loading={isWaitingForIframeData}>
              Save
            </Button>
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
