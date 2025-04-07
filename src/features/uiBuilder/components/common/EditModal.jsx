/* eslint-disable react/prop-types */
import { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Button,
  CircularProgress,
} from '@mui/joy';
import ColumnFormFields from '../table/ColumnFormFields';
import FieldFormFields from '../table/FieldFormFields';
import { useSelector } from 'react-redux';
import useFetchEntities from '../../../../shared/hooks/useFetchEntities';

export default function EditModal({
  open,
  onClose,
  item,
  onSave,
  onDelete,
  type,
  title,
  mainEntity,
}) {
  const [editedItem, setEditedItem] = useState(item);
  const [inputValue, setInputValue] = useState('');
  const columnFormRef = useRef(null);
  const [isWaitingForIframeData, setIsWaitingForIframeData] = useState(false);
  const [isIFrame, setIsIFrame] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isIframeValidationError, setIsIframeValidationError] = useState(false);
  const filteredEntities = useSelector(
    (state) => state.fetchedData.filteredEntities,
  );

  const loading = useFetchEntities();

  useEffect(() => {
    setValidationError('');
    setIsIframeValidationError(false);
  }, [editedItem]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'IFRAME_DATA_RESPONSE') {
        if (isWaitingForIframeData) {
          const dataItems = Array.isArray(event.data.payload)
            ? event.data.payload
            : [event.data.payload];

          let hasValidationError = false;

          dataItems.forEach((dataItem, index) => {
            const entityName =
              dataItem.d.results[0].__metadata.type.split('.')[1];
            const propertyName = Object.keys(dataItem.d.results[0]).find(
              (key) => key !== '__metadata',
            );

            const extractedData = dataItem.d.results.map(
              (result) => result[propertyName],
            );

            const completeEntity = filteredEntities.find(
              (entity) => entity.name === entityName,
            );

            const columnData = {
              ...editedItem,
              data: extractedData,
              label: `${entityName} -> ${propertyName}`,
              isNewColumn: index > 0,
              entity: completeEntity,
            };

            if (
              columnData.entity &&
              !columnData.isMainEntity &&
              mainEntity &&
              columnData.entity.name !== mainEntity.name
            ) {
              setValidationError(
                `This column cannot be saved because its entity (${columnData.entity.name}) does not match the main entity (${mainEntity.name}). Either make it the main entity or choose a different entity.`,
              );
              setIsIframeValidationError(true);
              hasValidationError = true;
              return;
            }

            onSave(columnData);
          });

          setIsWaitingForIframeData(false);

          if (!hasValidationError) {
            onClose();
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [
    editedItem,
    isWaitingForIframeData,
    onSave,
    onClose,
    filteredEntities,
    mainEntity,
  ]);

  const handleSave = useCallback(() => {
    if (type === 'column') {
      if (
        editedItem.entity &&
        !editedItem.isMainEntity &&
        !editedItem.relation &&
        mainEntity &&
        editedItem.entity.name !== mainEntity.name
      ) {
        setValidationError(
          `This column cannot be saved because its entity (${editedItem.entity.name}) does not match the main entity (${mainEntity.name}). Either make it the main entity, choose a different entity, or define a relationship between the entities.`,
        );
        setIsIframeValidationError(false);
        return;
      }
      setValidationError('');

      if (columnFormRef.current && isIFrame) {
        setIsWaitingForIframeData(true);
        columnFormRef.current.triggerIframeDataFetch();
      } else {
        onSave(editedItem);
        onClose();
      }
    } else {
      onSave(editedItem);
      onClose();
    }
  }, [editedItem, onSave, onClose, type, isIFrame, mainEntity]);

  const handleDelete = useCallback(() => {
    onDelete(item.id);
    onClose();
  }, [item, onDelete, onClose]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose onClick={onClose} />
        <Typography level='h4'>{title}</Typography>
        {loading ? (
          <div className='flex justify-center items-center p-4'>
            <CircularProgress />
          </div>
        ) : (
          <div>
            {type === 'column' ? (
              <ColumnFormFields
                ref={columnFormRef}
                editedItem={editedItem}
                setEditedItem={setEditedItem}
                isIFrame={isIFrame}
                setIsIFrame={setIsIFrame}
                setIsWaitingForIframeData={setIsWaitingForIframeData}
                mainEntity={mainEntity}
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
                <Button
                  onClick={handleSave}
                  loading={isWaitingForIframeData}
                  disabled={!!validationError && !isIframeValidationError}
                >
                  Save
                </Button>
              </div>
              {validationError && (
                <Typography
                  color='danger'
                  level='body-sm'
                  sx={{ mt: 1, maxWidth: '400px' }}
                >
                  {validationError}
                </Typography>
              )}
            </div>
          </div>
        )}
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
    relation: PropTypes.shape({
      type: PropTypes.string,
      property: PropTypes.object,
      label: PropTypes.string,
    }),
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['column', 'field']).isRequired,
  title: PropTypes.string.isRequired,
  mainEntity: PropTypes.shape({
    name: PropTypes.string,
    properties: PropTypes.shape({
      navigationProperties: PropTypes.array,
    }),
  }),
};
