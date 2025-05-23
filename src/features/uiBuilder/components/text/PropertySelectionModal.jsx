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
} from '@mui/joy';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback, useMemo } from 'react';

// Helper function to recursively extract all properties from nested objects
const extractProperties = (obj, prefix = '') => {
  if (!obj || typeof obj !== 'object') {
    return [];
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (key === '__metadata') return acc;

    const currentPath = prefix ? `${prefix}.${key}` : key;

    // Handle arrays of objects
    if (
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === 'object'
    ) {
      const nestedProps = extractProperties(value[0], currentPath);
      return [...acc, ...nestedProps];
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

    // If we're accessing an array, get the first item
    if (Array.isArray(current[key])) {
      return current[key][0];
    }

    return current[key];
  }, obj);
};

export default function PropertySelectionModal({
  open,
  onClose,
  onPropertySelected,
  data,
}) {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [showValueSelection, setShowValueSelection] = useState(false);

  // Reset all states when modal is closed
  useEffect(() => {
    if (!open) {
      setSelectedProperty(null);
      setSelectedValue(null);
      setShowValueSelection(false);
    }
  }, [open]);

  // Get all properties from the first result, including nested ones
  const properties = useMemo(() => {
    if (!data?.[0]?.d?.results?.[0]) {
      return [];
    }

    const firstResult = data[0].d.results[0];
    return extractProperties(firstResult);
  }, [data]);

  const handleConfirm = useCallback(() => {
    if (selectedProperty && selectedValue) {
      onPropertySelected(selectedProperty, selectedValue);
      onClose();
    }
  }, [selectedProperty, selectedValue, onPropertySelected, onClose]);

  const handlePropertySelect = useCallback(
    (property) => {
      setSelectedProperty(property);

      // Get all unique values for the selected property
      const values =
        data?.[0]?.d?.results
          ?.map((result, index) => {
            const value = getNestedValue(result, property);

            // If the value is an object, try to get a meaningful string representation
            let displayValue = value;
            if (value && typeof value === 'object') {
              displayValue = Object.values(value)
                .filter(
                  (v) => v !== null && v !== undefined && typeof v !== 'object',
                )
                .join(' ');
            }

            return {
              id: `${value}-${index}`,
              label: displayValue?.toString() || '',
              value: value,
              metadata: result.__metadata,
            };
          })
          .filter((item) => item.label && item.label.trim() !== '')
          .filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.label === item.label),
          ) || [];

      // If there's only one value, automatically select it
      if (values.length === 1) {
        setSelectedValue(values[0]);
        handleConfirm();
      } else {
        setShowValueSelection(true);
      }
    },
    [data, handleConfirm],
  );

  // Auto-select property if there's only one
  useEffect(() => {
    if (open && properties.length === 1) {
      handlePropertySelect(properties[0]);
    }
  }, [open, properties, handlePropertySelect]);

  const handleClose = () => {
    setSelectedProperty(null);
    setSelectedValue(null);
    setShowValueSelection(false);
    onClose();
  };

  // Get all unique values for the selected property from all results
  const values =
    (selectedProperty &&
      data?.[0]?.d?.results
        ?.map((result, index) => {
          const value = getNestedValue(result, selectedProperty);
          return {
            id: `${value}-${index}`,
            label: value?.toString() || '',
            value: value,
            metadata: result.__metadata,
          };
        })
        .filter((item) => item.label && item.label.trim() !== '')
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.label === item.label),
        )) ||
    [];

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog>
        <ModalClose onClick={handleClose} />
        <Typography level='h4'>Select Property and Value</Typography>
        <div className='flex flex-col gap-4 mt-3'>
          {!showValueSelection ? (
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
          <div className='flex justify-end gap-2 mt-4'>
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
              disabled={!selectedProperty || !selectedValue}
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
  data: PropTypes.array,
};
