import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Button,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Autocomplete,
  Alert,
} from '@mui/joy';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

// Helper function to recursively extract all properties from nested objects
const extractProperties = (obj, prefix = '') => {
  if (!obj || typeof obj !== 'object') {
    return [];
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (key === '__metadata') return acc;

    const currentPath = prefix ? `${prefix}.${key}` : key;

    // Handle arrays - treat them as a single property, don't extract individual items
    if (Array.isArray(value)) {
      return [...acc, currentPath];
    }

    // Handle nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nestedProps = extractProperties(value, currentPath);
      return [...acc, ...nestedProps];
    }

    return [...acc, currentPath];
  }, []);
};

// Helper function to get value from nested object using dot notation
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    if (!current) return undefined;

    // If we're accessing an array, return the entire array
    if (Array.isArray(current[key])) {
      return current[key];
    }

    return current[key];
  }, obj);
};

export default function PropertySelectionModal({
  open,
  onClose,
  onPropertySelected,
}) {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [showValueSelection, setShowValueSelection] = useState(false);
  const [showNodeWarning, setShowNodeWarning] = useState(false);

  // Get selectedNode and dataPickerConfigEntries from Redux store
  const selectedNode = useSelector((state) => state.dataPicker.selectedNode);
  const dataPickerConfigEntries = useSelector(
    (state) => state.dataPicker.dataPickerConfigEntries,
  );
  const dataPickerResults = useSelector(
    (state) => state.dataPicker.dataPickerResults,
  );

  // Reset all states when modal is closed
  useEffect(() => {
    if (!open) {
      setSelectedProperty(null);
      setSelectedValue(null);
      setShowValueSelection(false);
      setShowNodeWarning(false);
    }
  }, [open]);

  // Check if a node is selected when modal opens
  useEffect(() => {
    if (open && !selectedNode) {
      setShowNodeWarning(true);
    } else if (open && selectedNode) {
      setShowNodeWarning(false);
    }
  }, [open, selectedNode]);

  // Close modal if no data is available when it opens
  useEffect(() => {
    if (open && (!dataPickerResults || dataPickerResults.length === 0)) {
      onClose();
    }
  }, [open, dataPickerResults, onClose]);

  // Get all properties from the first result, including nested ones
  const properties = useMemo(() => {
    // If no node is selected, return empty array
    if (!selectedNode) {
      return [];
    }

    // Find the correct data based on selectedNode
    let targetData = null;
    if (selectedNode && dataPickerResults && dataPickerResults.length > 0) {
      // The data array should correspond to the dataPickerConfigEntries array
      // We need to find the index of the selectedNode in the config entries
      // and use that same index for the data array

      if (dataPickerConfigEntries && dataPickerConfigEntries.length > 0) {
        // Find the index of the selectedNode in the config entries
        const selectedConfigIndex = dataPickerConfigEntries.findIndex(
          ([nodeId]) => nodeId === selectedNode,
        );

        if (
          selectedConfigIndex >= 0 &&
          dataPickerResults[selectedConfigIndex]
        ) {
          targetData = dataPickerResults[selectedConfigIndex];
        } else {
          // If selected node not found in config, don't fallback to first data
          return [];
        }
      } else {
        // If no config entries, don't fallback to first data
        return [];
      }
    } else {
      // If no data, return empty array
      return [];
    }

    if (!targetData) {
      return [];
    }

    if (!targetData?.d?.results?.[0]) {
      // Try alternative data structures
      if (targetData && Array.isArray(targetData) && targetData.length > 0) {
        const firstResult = targetData[0]; // Take first object from the array
        const extractedProps = extractProperties(firstResult);
        return extractedProps;
      } else if (targetData && typeof targetData === 'object') {
        const firstResult = targetData;
        const extractedProps = extractProperties(firstResult);
        return extractedProps;
      }

      return [];
    }

    const firstResult = targetData.d.results[0];
    const extractedProps = extractProperties(firstResult);
    return extractedProps;
  }, [dataPickerResults, selectedNode, dataPickerConfigEntries]);

  const handleConfirm = useCallback(() => {
    if (selectedProperty && selectedValue) {
      onPropertySelected(selectedProperty, selectedValue);
      onClose();
    }
  }, [selectedProperty, selectedValue, onPropertySelected, onClose]);

  const handlePropertySelect = useCallback(
    (property) => {
      setSelectedProperty(property);

      // Find the correct data based on selectedNode
      let targetData = null;
      if (selectedNode && dataPickerResults && dataPickerResults.length > 0) {
        if (dataPickerConfigEntries && dataPickerConfigEntries.length > 0) {
          // Find the index of the selectedNode in the config entries
          const selectedConfigIndex = dataPickerConfigEntries.findIndex(
            ([nodeId]) => nodeId === selectedNode,
          );

          if (
            selectedConfigIndex >= 0 &&
            dataPickerResults[selectedConfigIndex]
          ) {
            targetData = dataPickerResults[selectedConfigIndex];
          } else {
            // If selected node not found in config, don't fallback to first data
            return;
          }
        } else {
          // If no config entries, don't fallback to first data
          return;
        }
      } else {
        // If no data, return
        return;
      }

      // Get all unique values for the selected property
      let results = null;

      if (targetData?.d?.results) {
        // Original structure
        results = targetData.d.results;
      } else if (Array.isArray(targetData)) {
        // Alternative structure - targetData is an array of objects
        results = targetData;
      }

      if (!results) {
        return;
      }

      const values = results
        .map((result, index) => {
          const value = getNestedValue(result, property);

          // If the value is an array, extract values from each element
          if (Array.isArray(value)) {
            const arrayValues = value.map((item, itemIndex) => {
              let displayValue = item;
              if (item && typeof item === 'object') {
                displayValue = Object.values(item)
                  .filter(
                    (v) =>
                      v !== null && v !== undefined && typeof v !== 'object',
                  )
                  .join(' ');
              }
              return {
                id: `${item}-${index}-${itemIndex}`,
                label: displayValue?.toString() || '',
                value: item,
                metadata: result.__metadata,
              };
            });
            return arrayValues;
          }

          // If the value is an object, try to get a meaningful string representation
          let displayValue = value;
          if (value && typeof value === 'object') {
            displayValue = Object.values(value)
              .filter(
                (v) => v !== null && v !== undefined && typeof v !== 'object',
              )
              .join(' ');
          }

          return [
            {
              id: `${value}-${index}`,
              label: displayValue?.toString() || '',
              value: value,
              metadata: result.__metadata,
            },
          ];
        })
        .flat() // Flatten the array of arrays
        .filter((item) => item.label && item.label.trim() !== '')
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.label === item.label),
        );

      // If there's only one value, automatically select it
      if (values.length === 1) {
        setSelectedValue(values[0]);
        onPropertySelected(property, values[0]);
        onClose();
      } else {
        setShowValueSelection(true);
      }
    },
    [
      dataPickerResults,
      onPropertySelected,
      onClose,
      selectedNode,
      dataPickerConfigEntries,
    ],
  );

  // Auto-select property if there's only one and a node is selected
  useEffect(() => {
    if (open && properties.length === 1 && selectedNode) {
      handlePropertySelect(properties[0]);
    }
  }, [open, properties, handlePropertySelect, selectedNode]);

  const handleClose = () => {
    setSelectedProperty(null);
    setSelectedValue(null);
    setShowValueSelection(false);
    setShowNodeWarning(false);
    onClose();
  };

  // Get all unique values for the selected property from all results
  const values = useMemo(() => {
    if (!selectedProperty || !selectedNode) {
      return [];
    }

    // Find the correct data based on selectedNode
    let targetData = null;
    if (selectedNode && dataPickerResults && dataPickerResults.length > 0) {
      if (dataPickerConfigEntries && dataPickerConfigEntries.length > 0) {
        // Find the index of the selectedNode in the config entries
        const selectedConfigIndex = dataPickerConfigEntries.findIndex(
          ([nodeId]) => nodeId === selectedNode,
        );

        if (
          selectedConfigIndex >= 0 &&
          dataPickerResults[selectedConfigIndex]
        ) {
          targetData = dataPickerResults[selectedConfigIndex];
        } else {
          // If selected node not found in config, don't fallback to first data
          return [];
        }
      } else {
        // If no config entries, don't fallback to first data
        return [];
      }
    } else {
      // If no data, return empty array
      return [];
    }

    // Try different data structures
    let results = null;

    if (targetData?.d?.results) {
      // Original structure
      results = targetData.d.results;
    } else if (Array.isArray(targetData)) {
      // Alternative structure - targetData is an array of objects
      results = targetData;
    }

    if (!results) {
      return [];
    }

    const resultValues = results
      .map((result, index) => {
        const value = getNestedValue(result, selectedProperty);

        // If the value is an array, extract values from each element
        if (Array.isArray(value)) {
          const arrayValues = value.map((item, itemIndex) => {
            return {
              id: `${item}-${index}-${itemIndex}`,
              label: item?.toString() || '',
              value: item,
              metadata: result.__metadata,
            };
          });
          return arrayValues;
        }

        return [
          {
            id: `${value}-${index}`,
            label: value?.toString() || '',
            value: value,
            metadata: result.__metadata,
          },
        ];
      })
      .flat() // Flatten the array of arrays
      .filter((item) => item.label && item.label.trim() !== '')
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.label === item.label),
      );

    return resultValues;
  }, [
    selectedProperty,
    dataPickerResults,
    selectedNode,
    dataPickerConfigEntries,
  ]);

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog>
        <ModalClose onClick={handleClose} />
        <Typography level='h4'>Select Property and Value</Typography>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginTop: '12px',
          }}
        >
          {showNodeWarning ? (
            <Alert color='warning' variant='soft'>
              <Typography level='body-sm'>
                Please select a node in the DataPicker flow first before you can
                select a property.
              </Typography>
            </Alert>
          ) : !showValueSelection ? (
            <RadioGroup
              value={selectedProperty}
              onChange={(e) => handlePropertySelect(e.target.value)}
            >
              <List>
                {properties.map((property) => (
                  <ListItem key={property}>
                    <Radio
                      value={property}
                      label={property}
                      checked={selectedProperty === property}
                    />
                  </ListItem>
                ))}
              </List>
            </RadioGroup>
          ) : (
            <Autocomplete
              options={values}
              value={selectedValue}
              onChange={(_, newValue) => setSelectedValue(newValue)}
              getOptionLabel={(option) => option.label}
              getOptionKey={(option) => option.id}
              placeholder={`Select a value for ${selectedProperty}`}
              sx={{ width: '100%' }}
            />
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '16px',
            }}
          >
            {showValueSelection && (
              <Button
                variant='plain'
                color='neutral'
                onClick={() => {
                  setShowValueSelection(false);
                  setSelectedValue(null);
                }}
              >
                Back
              </Button>
            )}
            <Button variant='plain' color='neutral' onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant='solid'
              color='primary'
              onClick={handleConfirm}
              disabled={!selectedProperty || !selectedValue || showNodeWarning}
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </ModalDialog>
    </Modal>
  );
}

PropertySelectionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPropertySelected: PropTypes.func.isRequired,
};
