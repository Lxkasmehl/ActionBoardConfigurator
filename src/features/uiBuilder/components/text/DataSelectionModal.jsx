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
import {
  setDataPickerLoading,
  triggerDataFetch,
  clearDataPickerState,
} from '@/redux/dataPickerSlice';

export default function DataSelectionModal({ open, onClose, onDataSelected }) {
  const [warningMessage, setWarningMessage] = useState(null);
  const [showNodeWarning, setShowNodeWarning] = useState(false);
  const dispatch = useDispatch();

  const isDataPickerLoading = useSelector(
    (state) => state.dataPicker.isDataPickerLoading,
  );

  const selectedNode = useSelector((state) => state.dataPicker.selectedNode);

  // Clear dataPicker state when modal opens to ensure clean state
  useEffect(() => {
    if (open) {
      dispatch(clearDataPickerState());
      setWarningMessage(null);
      setShowNodeWarning(false);
    }
  }, [open, dispatch]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!open) {
      setWarningMessage(null);
      setShowNodeWarning(false);
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
      onDataSelected(data);
      // onClose();
      dispatch(setDataPickerLoading(false));
    },
    [onDataSelected, dispatch],
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
    dispatch(setDataPickerLoading(true));
    dispatch(triggerDataFetch());
  }, [dispatch, selectedNode]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose onClick={onClose} />
        <Typography level='h4'>Select Data</Typography>
        <div className='flex flex-col gap-4 mt-3'>
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
          <div className='flex justify-end gap-2 mt-4'>
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
