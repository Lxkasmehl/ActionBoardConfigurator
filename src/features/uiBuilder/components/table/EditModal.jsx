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
import {
  setCombinedPropertiesMode,
  setTableConfigEntries,
} from '../../../../redux/uiBuilderSlice';
import {
  setDataPickerLoading,
  triggerDataFetch,
  clearDataPickerState,
} from '../../../../redux/dataPickerSlice';
import WarningModal from './WarningModal';

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
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [confirmedWarning, setConfirmedWarning] = useState(false);
  const filteredEntities = useSelector(
    (state) => state.fetchedData.filteredEntities,
  );
  const isCombinedProperties = useSelector(
    (state) =>
      state.uiBuilder.combinedPropertiesMode[component.id]?.[item.id] || false,
  );
  const stringifiedPath = JSON.stringify(editedItem.nestedNavigationPath);

  // Redux state for DataPicker communication
  const {
    dataPickerResults,
    dataPickerConfigEntries,
    dataPickerWarning,
    isDataPickerLoading,
    selectedNode,
  } = useSelector((state) => state.dataPicker);

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

  // Custom close handler that resets loading states immediately
  const handleClose = useCallback(() => {
    // Immediately reset loading states
    setIsWaitingForIframeData(false);
    setConfirmedWarning(false);
    setShowWarningModal(false);
    setWarningMessage('');
    setValidationError('');
    setIsIframeValidationError(false);
    dispatch(setDataPickerLoading(false));
    dispatch(clearDataPickerState());

    // Then call the original onClose
    onClose();
  }, [onClose, dispatch]);

  // Handle DataPicker results from Redux
  useEffect(() => {
    if (dataPickerWarning) {
      setWarningMessage(dataPickerWarning);
      setShowWarningModal(true);
      setValidationError(dataPickerWarning);
      setIsWaitingForIframeData(false);
      dispatch(setDataPickerLoading(false));
    }
  }, [dataPickerWarning, dispatch]);

  // Separate useEffect to handle confirmedWarning state changes
  useEffect(() => {
    if (confirmedWarning && dataPickerResults && dataPickerConfigEntries) {
      // Process all flows
      const dataItems = Array.isArray(dataPickerResults)
        ? dataPickerResults
        : [dataPickerResults];
      const configItems = dataPickerConfigEntries;

      if (!dataItems || !configItems) {
        console.error('No valid data or config found for processing');
        setValidationError(
          'No valid data found for the selected flow. Please select a node in the DataPicker and try again.',
        );
        setIsWaitingForIframeData(false);
        dispatch(setDataPickerLoading(false));
        return;
      }

      let hasValidationError = false;

      dataItems.forEach((dataItem, index) => {
        // Handle the formatted data structure from formatODataResult
        // The data is already cleaned up and doesn't have the original OData structure
        if (!dataItem || !Array.isArray(dataItem) || dataItem.length === 0) {
          console.error('Invalid dataItem structure:', dataItem);
          setValidationError('Invalid data structure received from DataPicker');
          setIsWaitingForIframeData(false);
          dispatch(setDataPickerLoading(false));
          return;
        }

        // Get the first result to determine entity and properties
        const firstResult = dataItem[0];
        if (!firstResult || typeof firstResult !== 'object') {
          console.error('Invalid firstResult structure:', firstResult);
          setValidationError(
            'Invalid result structure received from DataPicker',
          );
          setIsWaitingForIframeData(false);
          dispatch(setDataPickerLoading(false));
          return;
        }

        // Get config entry for this data item
        const configEntry = configItems[index];
        if (
          !configEntry ||
          !Array.isArray(configEntry) ||
          configEntry.length < 2
        ) {
          console.error('Invalid configEntry structure:', configEntry);
          setValidationError(
            'Invalid configuration structure received from DataPicker',
          );
          setIsWaitingForIframeData(false);
          dispatch(setDataPickerLoading(false));
          return;
        }

        const entityName = Object.keys(configEntry[1])[0];
        if (!entityName) {
          console.error('No entity name found in configEntry');
          setValidationError(
            'No entity information found in DataPicker configuration',
          );
          setIsWaitingForIframeData(false);
          dispatch(setDataPickerLoading(false));
          return;
        }

        const completeEntity = filteredEntities.find(
          (entity) => entity.name === entityName,
        );

        if (!completeEntity) {
          console.error('Entity not found:', entityName);
          setValidationError(
            `Entity ${entityName} not found in available entities`,
          );
          setIsWaitingForIframeData(false);
          dispatch(setDataPickerLoading(false));
          return;
        }

        // Get property names from the first result
        const propertyNames = Object.keys(firstResult);

        propertyNames.forEach((propertyName, propertyIndex) => {
          const extractedData = dataItem.map((result) => result[propertyName]);

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

          const newColumnData = isIframeValidationError
            ? {
                ...columnData,
                ...baseColumnData,
                configEntries: [configEntry],
              }
            : {
                ...editedItem,
                ...baseColumnData,
                configEntries: [configEntry],
              };
          setColumnData(newColumnData);

          if (validateColumnData(newColumnData)) {
            hasValidationError = true;
            return;
          }

          onSave(newColumnData);
        });
      });

      // After processing all data items, close the modal and reset states
      setIsWaitingForIframeData(false);
      dispatch(setDataPickerLoading(false));

      if (!hasValidationError) {
        handleClose();
      }
    }
  }, [
    confirmedWarning,
    dataPickerResults,
    dataPickerConfigEntries,
    filteredEntities,
    editedItem,
    columnData,
    isIframeValidationError,
    validateColumnData,
    onSave,
    handleClose,
    dispatch,
  ]);

  const handleWarningConfirm = () => {
    setShowWarningModal(false);
    setConfirmedWarning(true);
    setIsWaitingForIframeData(true);
    dispatch(setDataPickerLoading(true));
  };

  const handleWarningCancel = () => {
    setIsWaitingForIframeData(false);
    setShowWarningModal(false);
    setConfirmedWarning(false);
    dispatch(setDataPickerLoading(false));
  };

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
    if (
      editedItem.entity &&
      !editedItem.property &&
      !isCombinedProperties &&
      !isIFrame
    ) {
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

    if (isIFrame) {
      setIsWaitingForIframeData(true);
      setConfirmedWarning(false); // Reset warning confirmation
      dispatch(setDataPickerLoading(true));
      dispatch(triggerDataFetch());
    } else {
      const itemToSave = isCombinedProperties
        ? { ...editedItem, combinedProperties }
        : editedItem;

      dispatch(
        setTableConfigEntries({
          componentId: component.id,
          columnId: itemToSave.id,
          configEntries: [
            itemToSave.id,
            {
              [itemToSave.entity.name]: {
                filter: {
                  entityLogic: 'AND',
                  conditions: itemToSave.conditions || [],
                },
                selectedProperties: itemToSave.combinedProperties
                  ? itemToSave.combinedProperties.map((prop) => {
                      if (prop.nestedProperty) {
                        return {
                          name: prop.nestedProperty.name,
                          navigationProperties: prop.nestedNavigationPath || [],
                        };
                      }
                      return {
                        name: prop.name,
                        navigationProperties: [],
                      };
                    })
                  : itemToSave.nestedProperty
                    ? [
                        {
                          name: itemToSave.nestedProperty.name,
                          navigationProperties:
                            itemToSave.nestedNavigationPath || [],
                        },
                      ]
                    : [
                        {
                          name: itemToSave.property.name,
                          navigationProperties: [],
                        },
                      ],
              },
            },
          ],
        }),
      );

      onSave(itemToSave);
      handleClose();
    }
  }, [
    editedItem,
    onSave,
    handleClose,
    isIFrame,
    mainEntity,
    isCombinedProperties,
    combinedProperties,
    dispatch,
    component.id,
  ]);

  const handleDelete = useCallback(() => {
    onDelete(item.id);
    handleClose();
  }, [item, onDelete, handleClose]);

  // Original useEffect for normal processing (with selectedNode)
  useEffect(() => {
    if (
      dataPickerResults &&
      dataPickerConfigEntries &&
      isWaitingForIframeData &&
      !confirmedWarning
    ) {
      let dataItems;
      let configItems;

      // Only process the selected flow
      if (selectedNode && dataPickerConfigEntries) {
        const selectedConfig = dataPickerConfigEntries.find(
          ([nodeId]) => nodeId === selectedNode,
        );
        if (selectedConfig) {
          // Find the corresponding data for the selected node
          const selectedDataIndex = dataPickerConfigEntries.findIndex(
            ([nodeId]) => nodeId === selectedNode,
          );
          if (selectedDataIndex >= 0 && dataPickerResults[selectedDataIndex]) {
            dataItems = [dataPickerResults[selectedDataIndex]];
            configItems = [selectedConfig];
          } else {
            console.error('Selected data not found:', {
              selectedDataIndex,
              dataPickerResultsLength: dataPickerResults.length,
              selectedNode,
            });
          }
        } else {
          console.error('Selected config not found for node:', selectedNode);
        }
      } else {
        // If no node is selected, show warning modal to let user choose
        setWarningMessage(
          'No specific node is selected in the DataPicker flow. Would you like to process all flows and create separate columns for each?',
        );
        setShowWarningModal(true);
        setIsWaitingForIframeData(false);
        dispatch(setDataPickerLoading(false));
        return;
      }

      if (!dataItems || !configItems) {
        console.error('No valid data or config found for processing');
        setValidationError(
          'No valid data found for the selected flow. Please select a node in the DataPicker and try again.',
        );
        setIsWaitingForIframeData(false);
        dispatch(setDataPickerLoading(false));
        return;
      }

      let hasValidationError = false;

      dataItems.forEach((dataItem, index) => {
        // Handle the formatted data structure from formatODataResult
        // The data is already cleaned up and doesn't have the original OData structure
        if (!dataItem || !Array.isArray(dataItem) || dataItem.length === 0) {
          console.error('Invalid dataItem structure:', dataItem);
          setValidationError('Invalid data structure received from DataPicker');
          setIsWaitingForIframeData(false);
          dispatch(setDataPickerLoading(false));
          return;
        }

        // Get the first result to determine entity and properties
        const firstResult = dataItem[0];
        if (!firstResult || typeof firstResult !== 'object') {
          console.error('Invalid firstResult structure:', firstResult);
          setValidationError(
            'Invalid result structure received from DataPicker',
          );
          setIsWaitingForIframeData(false);
          dispatch(setDataPickerLoading(false));
          return;
        }

        // Get config entry for this data item
        const configEntry = configItems[index];
        if (
          !configEntry ||
          !Array.isArray(configEntry) ||
          configEntry.length < 2
        ) {
          console.error('Invalid configEntry structure:', configEntry);
          setValidationError(
            'Invalid configuration structure received from DataPicker',
          );
          setIsWaitingForIframeData(false);
          dispatch(setDataPickerLoading(false));
          return;
        }

        const entityName = Object.keys(configEntry[1])[0];
        if (!entityName) {
          console.error('No entity name found in configEntry');
          setValidationError(
            'No entity information found in DataPicker configuration',
          );
          setIsWaitingForIframeData(false);
          dispatch(setDataPickerLoading(false));
          return;
        }

        const completeEntity = filteredEntities.find(
          (entity) => entity.name === entityName,
        );

        if (!completeEntity) {
          console.error('Entity not found:', entityName);
          setValidationError(
            `Entity ${entityName} not found in available entities`,
          );
          setIsWaitingForIframeData(false);
          dispatch(setDataPickerLoading(false));
          return;
        }

        // Get property names from the first result
        const propertyNames = Object.keys(firstResult);

        propertyNames.forEach((propertyName, propertyIndex) => {
          const extractedData = dataItem.map((result) => result[propertyName]);

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

          const newColumnData = isIframeValidationError
            ? {
                ...columnData,
                ...baseColumnData,
                configEntries: [configEntry],
              }
            : {
                ...editedItem,
                ...baseColumnData,
                configEntries: [configEntry],
              };
          setColumnData(newColumnData);

          if (validateColumnData(newColumnData)) {
            hasValidationError = true;
            return;
          }

          onSave(newColumnData);
        });
      });

      // After processing all data items, close the modal and reset states
      setIsWaitingForIframeData(false);
      dispatch(setDataPickerLoading(false));

      if (!hasValidationError) {
        handleClose();
      }
    }
  }, [
    dataPickerResults,
    dataPickerConfigEntries,
    isWaitingForIframeData,
    selectedNode,
    confirmedWarning,
    onSave,
    handleClose,
    filteredEntities,
    mainEntity,
    columnData,
    isIframeValidationError,
    validateColumnData,
    editedItem,
    dispatch,
  ]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!open) {
      // Reset all loading states when modal closes
      setIsWaitingForIframeData(false);
      setConfirmedWarning(false);
      setShowWarningModal(false);
      setWarningMessage('');
      setValidationError('');
      setIsIframeValidationError(false);
      dispatch(setDataPickerLoading(false));
      dispatch(clearDataPickerState());
    }
  }, [open, dispatch]);

  return (
    <>
      <Modal open={open} onClose={handleClose} data-testid='edit-modal'>
        <ModalDialog>
          <ModalClose onClick={handleClose} />
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
              componentId={component.id}
              columnId={item.id}
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
                <Button variant='plain' color='neutral' onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  loading={isWaitingForIframeData || isDataPickerLoading}
                  disabled={!!validationError && !isIframeValidationError}
                  data-testid='save-button'
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

      {showWarningModal && (
        <WarningModal
          open={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          message={
            warningMessage || 'An error occurred while processing the data.'
          }
          onConfirm={handleWarningConfirm}
          onCancel={handleWarningCancel}
        />
      )}
    </>
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
