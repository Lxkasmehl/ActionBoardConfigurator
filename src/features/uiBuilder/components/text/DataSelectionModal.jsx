import { Modal, ModalDialog, ModalClose, Typography, Button } from '@mui/joy';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import DataPickerIframe from '../common/DataPickerIframe';

export default function DataSelectionModal({ open, onClose, onDataSelected }) {
  const [warningMessage, setWarningMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerFetch, setTriggerFetch] = useState(false);

  const handleWarning = useCallback((message) => {
    setWarningMessage(message);
  }, []);

  const handleDataFetch = useCallback(
    (data) => {
      onDataSelected(data);
      onClose();
      setIsLoading(false);
      setTriggerFetch(false);
    },
    [onDataSelected, onClose],
  );

  const handleEntitySelected = useCallback(() => {
    // We don't need to do anything with the selected entity in this context
    // as we only care about the final data selection
  }, []);

  const handleConfirm = useCallback(() => {
    setIsLoading(true);
    setTriggerFetch(true);
  }, []);

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
            triggerFetch={triggerFetch}
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
              loading={isLoading}
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
