import PropTypes from 'prop-types';
import { Modal, ModalDialog, Button, Typography, Alert } from '@mui/joy';
import WarningIcon from '@mui/icons-material/Warning';

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
        <Alert
          variant='soft'
          color='warning'
          startDecorator={<WarningIcon />}
          sx={{ mt: 1 }}
        >
          If you continue, the data for all flows in the DataPicker will be
          fetched and displayed in a different column for each flow.
        </Alert>
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
