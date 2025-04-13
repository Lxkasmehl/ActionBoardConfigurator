import PropTypes from 'prop-types';
import { Modal, ModalDialog, Button, Typography, Alert } from '@mui/joy';
import ReportIcon from '@mui/icons-material/Report';

const NoTableDataModal = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        variant='outlined'
        role='alertdialog'
      >
        <Typography level='h3'>No Table Data Available</Typography>
        <Alert
          variant='soft'
          color='danger'
          startDecorator={<ReportIcon />}
          sx={{
            mt: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <div>
            Please ensure that:
            <ul
              style={{
                paddingLeft: '1.5rem',
                listStyleType: 'disc',
              }}
            >
              <li>The button bar is grouped with a table component</li>
              <li>The table contains data</li>
            </ul>
            Both conditions must be met.
          </div>
        </Alert>
        <div className='flex justify-end gap-2 mt-4'>
          <Button variant='solid' color='primary' onClick={onClose}>
            OK
          </Button>
        </div>
      </ModalDialog>
    </Modal>
  );
};

NoTableDataModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NoTableDataModal;
