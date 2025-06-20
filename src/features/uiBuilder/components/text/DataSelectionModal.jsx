import { Modal, ModalDialog, ModalClose, Typography, Button } from '@mui/joy';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DataPickerIframe from '../common/DataPickerIframe';
import {
  setDataPickerLoading,
  triggerDataFetch,
} from '@/redux/dataPickerSlice';

export default function DataSelectionModal({ open, onClose, onDataSelected }) {
  const [warningMessage, setWarningMessage] = useState(null);
  const dispatch = useDispatch();

  const isDataPickerLoading = useSelector(
    (state) => state.dataPicker.isDataPickerLoading,
  );

  const handleWarning = useCallback((message) => {
    setWarningMessage(message);
  }, []);

  const handleDataFetch = useCallback(
    (data) => {
      onDataSelected(data);
      onClose();
      dispatch(setDataPickerLoading(false));
    },
    [onDataSelected, onClose, dispatch],
  );

  const handleEntitySelected = useCallback(() => {
    // For text components, we don't need to track entity selection
    // This is just to satisfy the DataPickerIframe prop requirements
  }, []);

  const handleConfirm = useCallback(() => {
    dispatch(setDataPickerLoading(true));
    dispatch(triggerDataFetch());
  }, [dispatch]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose onClick={onClose} />
        <Typography level='h4'>Select Data</Typography>
        <div className='flex flex-col gap-4 mt-3'>
          <DataPickerIframe
            onWarning={handleWarning}
            onDataFetch={handleDataFetch}
            onEntitySelected={handleEntitySelected}
            titleText='text area'
          />
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
