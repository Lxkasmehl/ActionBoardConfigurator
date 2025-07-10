import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Button,
  Alert,
} from '@mui/joy';
import PropTypes from 'prop-types';
import { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DataPickerContainer from '../common/DataPickerContainer';
import { setDataPickerLoading } from '@/redux/dataPickerSlice';

export default function DataSelectionModal({ open, onClose, onDataSelected }) {
  const [warningMessage, setWarningMessage] = useState(null);
  const [showNodeWarning, setShowNodeWarning] = useState(false);
  const [storedData, setStoredData] = useState(null);
  const dispatch = useDispatch();

  const isDataPickerLoading = useSelector(
    (state) => state.dataPicker.isDataPickerLoading,
  );

  const selectedNode = useSelector((state) => state.dataPicker.selectedNode);
  const dataPickerResults = useSelector(
    (state) => state.dataPicker.dataPickerResults,
  );
  const dataPickerConfigEntries = useSelector(
    (state) => state.dataPicker.dataPickerConfigEntries,
  );

  // Clear dataPicker state when modal opens to ensure clean state
  useEffect(() => {
    if (open) {
      // Don't clear the state here as we need the data for PropertySelectionModal
      // dispatch(clearDataPickerState());
      setWarningMessage(null);
      setShowNodeWarning(false);
    }
  }, [open, dispatch]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!open) {
      setWarningMessage(null);
      setShowNodeWarning(false);
      setStoredData(null);
    }
  }, [open]);

  // Check if a node is selected when modal opens or when selectedNode changes
  useEffect(() => {
    if (open && !selectedNode) {
      setShowNodeWarning(true);
    } else if (open && selectedNode) {
      setShowNodeWarning(false);
    }
  }, [open, selectedNode]);

  const handleWarning = useCallback((message) => {
    setWarningMessage(message);
  }, []);

  const handleDataFetch = useCallback(
    (data) => {
      // Store the data for later use when Confirm Selection is clicked
      setStoredData(data);
      dispatch(setDataPickerLoading(false));
    },
    [dispatch],
  );

  const handleEntitySelected = useCallback(() => {
    // For text components, we don't need to track entity selection
    // This is just to satisfy the DataPickerContainer prop requirements
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedNode) {
      setShowNodeWarning(true);
      return;
    }

    // Use stored data if available, otherwise fall back to Redux store
    const dataToUse =
      storedData ||
      (dataPickerResults && dataPickerConfigEntries
        ? {
            results: dataPickerResults,
            configEntries: dataPickerConfigEntries,
          }
        : null);

    if (dataToUse) {
      onDataSelected(dataToUse);
    }
  }, [
    selectedNode,
    onDataSelected,
    storedData,
    dataPickerResults,
    dataPickerConfigEntries,
  ]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose onClick={onClose} />
        <Typography level='h4'>Select Data</Typography>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginTop: '12px',
          }}
        >
          <DataPickerContainer
            onWarning={handleWarning}
            onDataFetch={handleDataFetch}
            onEntitySelected={handleEntitySelected}
            titleText='text area'
          />
          {showNodeWarning && (
            <Alert color='warning' variant='soft'>
              <Typography level='body-sm'>
                Please select a node in the DataPicker flow first before you can
                fetch data.
              </Typography>
            </Alert>
          )}
          {warningMessage && (
            <Typography color='warning' level='body-sm'>
              {warningMessage}
            </Typography>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '16px',
            }}
          >
            <Button variant='plain' color='neutral' onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant='solid'
              color='primary'
              onClick={handleConfirm}
              loading={isDataPickerLoading}
              disabled={showNodeWarning}
              data-testid='confirm-selection-button'
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </ModalDialog>
    </Modal>
  );
}

DataSelectionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDataSelected: PropTypes.func.isRequired,
};
