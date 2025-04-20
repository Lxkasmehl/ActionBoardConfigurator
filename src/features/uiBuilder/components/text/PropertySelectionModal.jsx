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

  // Get all properties except __metadata
  const properties = useMemo(
    () =>
      data && data[0]?.d?.results?.[0]
        ? Object.keys(data[0].d.results[0]).filter(
            (key) => key !== '__metadata',
          )
        : [],
    [data],
  );

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
          ?.map((result, index) => ({
            id: `${result[property]}-${index}`,
            label: result[property]?.toString() || '',
            value: result[property],
            metadata: result.__metadata,
          }))
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
        ?.map((result, index) => ({
          id: `${result[selectedProperty]}-${index}`,
          label: result[selectedProperty]?.toString() || '',
          value: result[selectedProperty],
          metadata: result.__metadata,
        }))
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
