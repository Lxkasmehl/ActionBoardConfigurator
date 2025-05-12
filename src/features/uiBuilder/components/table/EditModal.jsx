/* eslint-disable react/prop-types */
import { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Button,
  Switch,
} from '@mui/joy';
import ColumnFormFields from './ColumnFormFields';
import { useSelector, useDispatch } from 'react-redux';
import CombinedPropertiesSection from './CombinedPropertiesSection';
import { setCombinedPropertiesMode } from '../../../../redux/uiBuilderSlice';

export default function EditModal({
  open,
  onClose,
  item,
  onSave,
  onDelete,
  title,
  mainEntity,
  component,
}) {
  const dispatch = useDispatch();
  const [editedItem, setEditedItem] = useState(item);
  const columnFormRef = useRef(null);
  const [isWaitingForIframeData, setIsWaitingForIframeData] = useState(false);
  const [isIFrame, setIsIFrame] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isIframeValidationError, setIsIframeValidationError] = useState(false);
  const [columnData, setColumnData] = useState(null);
  const [combinedProperties, setCombinedProperties] = useState([]);
  const filteredEntities = useSelector(
    (state) => state.fetchedData.filteredEntities,
  );
  const isCombinedProperties = useSelector(
    (state) =>
      state.uiBuilder.combinedPropertiesMode[component.id]?.[item.id] || false,
  );
  const stringifiedPath = JSON.stringify(editedItem.nestedNavigationPath);

  useEffect(() => {
    // Only proceed if combined properties mode is enabled
    if (!isCombinedProperties) return;

    // If we already have combined properties, use them
    if (editedItem.combinedProperties) {
      setCombinedProperties(editedItem.combinedProperties);
      return;
    }

    // Handle new property addition
    const newProperty = editedItem.nestedProperty
      ? {
          nestedProperty: editedItem.nestedProperty,
          nestedNavigationPath: editedItem.nestedNavigationPath || [],
        }
      : editedItem.property;

    setCombinedProperties((prev) => [...prev, newProperty]);
  }, [
    isCombinedProperties,
    editedItem.nestedProperty,
    stringifiedPath,
    editedItem.nestedNavigationPath,
    editedItem.property,
    editedItem.combinedProperties,
  ]);

  const handleCombinedPropertiesChange = useCallback(
    (checked) => {
      dispatch(
        setCombinedPropertiesMode({
          componentId: component.id,
          columnId: item.id,
          isEnabled: checked,
        }),
      );
      if (!checked) {
        setCombinedProperties([]);
      }
    },
    [dispatch, component.id, item.id],
  );

  const handleCombinedPropertiesUpdate = useCallback((newProperties) => {
    setCombinedProperties(newProperties);
  }, []);

  const isEntityMismatch = useCallback(
    (newColumnData) => {
      if (!newColumnData.entity || !mainEntity) return false;
      return newColumnData.entity.name !== mainEntity.name;
    },
    [mainEntity],
  );

  const hasValidRelation = useCallback(
    (newColumnData) => {
      if (!newColumnData.relation || !newColumnData.relation.label)
        return false;
      return newColumnData.relation.label
        .split('->')
        .pop()
        .includes(mainEntity.name);
    },
    [mainEntity],
  );

  const validateColumnData = useCallback(
    (newColumnData) => {
      if (
        newColumnData.entity &&
        !newColumnData.isMainEntity &&
        isEntityMismatch(newColumnData) &&
        !hasValidRelation(newColumnData)
      ) {
        setValidationError(
          `This column cannot be saved because its entity (${newColumnData.entity.name}) does not match the main entity (${mainEntity.name}). Either make it the main entity or choose a different entity.`,
        );
        setIsIframeValidationError(true);
        return true;
      }
      return false;
    },
    [
      isEntityMismatch,
      hasValidRelation,
      mainEntity,
      setValidationError,
      setIsIframeValidationError,
    ],
  );

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

            const propertyNames = Object.keys(dataItem.d.results[0]).filter(
              (key) => key !== '__metadata',
            );

            propertyNames.forEach((propertyName, propertyIndex) => {
              const extractedData = dataItem.d.results.map(
                (result) => result[propertyName],
              );

              const completeEntity = filteredEntities.find(
                (entity) => entity.name === entityName,
              );

              const completeProperty = [
                ...(completeEntity.properties.properties || []),
                ...(completeEntity.properties.navigationProperties || []),
              ].find((property) => property.Name === propertyName);

              const baseColumnData = {
                data: extractedData,
                label: editedItem.label
                  ? index > 0 || propertyIndex > 0
                    ? `${editedItem.label} - ${propertyName}`
                    : editedItem.label
                  : `${entityName} -> ${propertyName}`,
                isNewColumn: index > 0 || propertyIndex > 0,
                entity: completeEntity,
                property: completeProperty,
              };

              const newColumnData = {
                ...(isIframeValidationError ? columnData : editedItem),
                ...baseColumnData,
              };

              setColumnData(newColumnData);

              if (validateColumnData(newColumnData)) {
                hasValidationError = true;
                return;
              }

              onSave(newColumnData);
            });

            setIsWaitingForIframeData(false);

            if (!hasValidationError) {
              onClose();
            }
          });
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
    columnData,
    isIframeValidationError,
    validateColumnData,
  ]);

  const handleSave = useCallback(() => {
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

    // Check if property is selected when entity is selected
    if (editedItem.entity && !editedItem.property && !isCombinedProperties) {
      setValidationError('Please select a property for the selected entity.');
      setIsIframeValidationError(false);
      return;
    }

    // Check if any navigation property is empty in the path
    if (
      editedItem.nestedNavigationPath?.length > 0 &&
      !editedItem.nestedProperty
    ) {
      setValidationError('Please select a property for all navigation paths.');
      setIsIframeValidationError(false);
      return;
    }

    setValidationError('');

    if (columnFormRef.current && isIFrame) {
      setIsWaitingForIframeData(true);
      columnFormRef.current.triggerIframeDataFetch();
    } else {
      const itemToSave = isCombinedProperties
        ? { ...editedItem, combinedProperties }
        : editedItem;
      onSave(itemToSave);
      onClose();
    }
  }, [
    editedItem,
    onSave,
    onClose,
    isIFrame,
    mainEntity,
    isCombinedProperties,
    combinedProperties,
  ]);

  const handleDelete = useCallback(() => {
    onDelete(item.id);
    onClose();
  }, [item, onDelete, onClose]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose onClick={onClose} />
        <Typography level='h4'>{title}</Typography>
        <div className='flex justify-center items-center flex-col'>
          <ColumnFormFields
            ref={columnFormRef}
            editedItem={editedItem}
            setEditedItem={setEditedItem}
            isIFrame={isIFrame}
            setIsIFrame={setIsIFrame}
            setIsWaitingForIframeData={setIsWaitingForIframeData}
            mainEntity={mainEntity}
            isIframeValidationError={isIframeValidationError}
            columnData={columnData}
            setColumnData={setColumnData}
            onSave={handleSave}
          />

          {!isIFrame && editedItem.entity && (
            <div className='w-full max-w-[500px] mt-4'>
              <div className='flex items-center justify-between mb-2'>
                <Typography level='body-md'>
                  Combine Multiple Properties
                </Typography>
                <Switch
                  checked={isCombinedProperties}
                  onChange={(e) =>
                    handleCombinedPropertiesChange(e.target.checked)
                  }
                />
              </div>

              {isCombinedProperties && (
                <>
                  <CombinedPropertiesSection
                    entity={editedItem.entity}
                    combinedProperties={combinedProperties}
                    setCombinedProperties={handleCombinedPropertiesUpdate}
                    componentId={component.id}
                    columnId={item.id}
                    setEditedItem={setEditedItem}
                  />
                </>
              )}
            </div>
          )}

          <div className='flex flex-col gap-4 mt-3 max-w-[500px] w-[100%]'>
            <Button
              variant='outlined'
              color='danger'
              onClick={handleDelete}
              className='w-full'
            >
              Delete Column
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
  component: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};
