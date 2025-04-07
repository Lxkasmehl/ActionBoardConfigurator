import PropTypes from 'prop-types';
import { Modal, ModalDialog, Button, Typography } from '@mui/joy';

const WarningModal = ({ open, onClose, message, onConfirm, onCancel }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        variant='outlined'
        role='alertdialog'
        aria-labelledby='warning-dialog-title'
        aria-describedby='warning-dialog-description'
      >
        <Typography level='h3'>Warning</Typography>
        <Typography sx={{ mt: 1 }}>{message}</Typography>
        <Typography
          variant='soft'
          color='danger'
          startDecorator='🚨'
          sx={{ mt: 1, padding: '10px', borderRadius: 5 }}
        >
          If you continue, the data for all flows in the DataPicker will be
          fetched and displayed in a different column for each flow.
        </Typography>
        <div className='flex justify-end gap-2 mt-4'>
          <Button variant='plain' color='neutral' onClick={onCancel}>
            Cancel
          </Button>
          <Button variant='solid' color='primary' onClick={onConfirm}>
            Continue
          </Button>
        </div>
      </ModalDialog>
    </Modal>
  );
};

WarningModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default WarningModal;
