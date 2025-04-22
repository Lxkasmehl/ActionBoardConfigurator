import { Modal, ModalDialog, ModalClose, Typography, Button } from '@mui/joy';
import PropTypes from 'prop-types';
import { useCallback, useState, useRef } from 'react';
import DataPickerIframe from '../common/DataPickerIframe';

export default function DataSelectionModal({ open, onClose, onDataSelected }) {
  const [warningMessage, setWarningMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef(null);

  const handleWarning = useCallback((message) => {
    setWarningMessage(message);
  }, []);

  const handleDataFetch = useCallback(
    (data) => {
      onDataSelected(data);
      onClose();
      setIsLoading(false);
    },
    [onDataSelected, onClose],
  );

  const handleConfirm = useCallback(() => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.triggerDataFetch();
    } else {
      const iframe = document.querySelector('iframe[src="/data-picker"]');
      if (iframe && iframe.triggerDataFetch) {
        iframe.triggerDataFetch();
      }
    }
  }, []);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose onClick={onClose} />
        <Typography level='h4'>Select Data</Typography>
        <div className='flex flex-col gap-4 mt-3'>
          <DataPickerIframe
            ref={iframeRef}
            onWarning={handleWarning}
            onDataFetch={handleDataFetch}
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
