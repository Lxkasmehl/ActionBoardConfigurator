import { Modal, Sheet, Typography, Button, CircularProgress } from '@mui/joy';
import JsonViewer from './JsonViewer';
import PropTypes from 'prop-types';

export default function ResultsModal({ open, onClose, isLoading, results }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      data-testid='results-modal'
    >
      <Sheet
        data-testid='results-modal'
        variant='outlined'
        sx={{
          borderRadius: 'md',
          p: 3,
          boxShadow: 'lg',
          bgcolor: '#fff',
        }}
      >
        <Typography
          level='h4'
          mb={2}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Results
          <Button variant='plain' color='neutral' size='sm' onClick={onClose}>
            Close
          </Button>
        </Typography>

        {isLoading ? (
          <div className='flex justify-center items-center p-4'>
            <CircularProgress size='lg' />
          </div>
        ) : (
          <div
            style={{
              overflowY: 'auto',
              maxHeight: '60vh',
              backgroundColor: '#fff',
              padding: '16px',
              borderRadius: '8px',
            }}
          >
            {results?.error ? (
              <Typography color='danger'>{results.error}</Typography>
            ) : (
              <JsonViewer data={results} />
            )}
          </div>
        )}
      </Sheet>
    </Modal>
  );
}

ResultsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  results: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.oneOf([null]),
  ]),
};
