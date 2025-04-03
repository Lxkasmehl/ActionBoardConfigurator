import PropTypes from 'prop-types';
import {
  FormControl,
  FormLabel,
  Input,
  Switch,
  Typography,
  Modal,
  ModalDialog,
  Button,
} from '@mui/joy';
import useFetchEntities from '../../../../shared/hooks/useFetchEntities';
import { sortEntities } from '../../../../shared/utils/entityOperations';
import { useSelector } from 'react-redux';
import {
  useMemo,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react';
import EntityPropertyFields from './EntityPropertyFields';

const ColumnFormFields = forwardRef(
  (
    {
      editedItem,
      setEditedItem,
      isIFrame,
      setIsIFrame,
      setIsWaitingForIframeData,
    },
    ref,
  ) => {
    const filteredEntities = useSelector(
      (state) => state.fetchedData.filteredEntities,
    );
    const sortedEntities = useMemo(
      () => sortEntities(filteredEntities),
      [filteredEntities],
    );
    const loading = useFetchEntities();
    const iframeRef = useRef(null);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    useEffect(() => {
      const handleMessage = (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'IFRAME_WARNING') {
          setWarningMessage(event.data.payload.message);
          setShowWarningModal(true);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [setEditedItem, editedItem]);

    const handleWarningConfirm = () => {
      setShowWarningModal(false);
      if (iframeRef.current) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'IFRAME_WARNING_RESPONSE',
            payload: { confirmed: true },
          },
          window.location.origin,
        );
      }
    };

    const handleWarningCancel = () => {
      setIsWaitingForIframeData(false);
      setShowWarningModal(false);
      if (iframeRef.current) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'IFRAME_WARNING_RESPONSE',
            payload: { confirmed: false },
          },
          window.location.origin,
        );
      }
    };

    const triggerIframeDataFetch = () => {
      if (iframeRef.current) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'FETCH_DATA_REQUEST',
          },
          window.location.origin,
        );
      }
    };

    useImperativeHandle(ref, () => ({
      triggerIframeDataFetch,
    }));

    return (
      <>
        <FormControl>
          <FormLabel>Label</FormLabel>
          <Input
            value={editedItem.label}
            onChange={(e) =>
              setEditedItem({ ...editedItem, label: e.target.value })
            }
            placeholder='Enter column label'
          />
        </FormControl>
        <div className='my-3'>
          <Typography level='title-md' sx={{ textAlign: 'center' }}>
            How to choose data for column
          </Typography>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '10px',
              gap: '20px',
            }}
          >
            <Typography
              sx={{ flex: 1, textAlign: 'right', whiteSpace: 'nowrap' }}
            >
              Form Fields
            </Typography>
            <Switch
              checked={isIFrame}
              onChange={(e) => setIsIFrame(e.target.checked)}
              sx={{
                '--Switch-gap': '20px',
              }}
            />
            <Typography
              sx={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}
            >
              DataPicker Flow
            </Typography>
          </div>
        </div>

        {!isIFrame ? (
          <EntityPropertyFields
            editedItem={editedItem}
            setEditedItem={setEditedItem}
            sortedEntities={sortedEntities}
            loading={loading}
          />
        ) : (
          <div>
            <Typography
              level='title-md'
              sx={{ textAlign: 'center', marginBottom: 2 }}
            >
              Select a node in the DataPicker Flow to display its corresponding
              backend result in the table column
            </Typography>
            <iframe
              ref={iframeRef}
              src='/data-picker'
              style={{
                width: '80vw',
                height: '50vh',
                borderRadius: '8px',
                border: '1px solid #ced8e2',
              }}
            />
          </div>
        )}

        <Modal
          open={showWarningModal}
          onClose={() => setShowWarningModal(false)}
        >
          <ModalDialog
            variant='outlined'
            role='alertdialog'
            aria-labelledby='warning-dialog-title'
            aria-describedby='warning-dialog-description'
          >
            <Typography level='h3'>Warning</Typography>
            <Typography sx={{ mt: 1 }}>{warningMessage}</Typography>
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
              <Button
                variant='plain'
                color='neutral'
                onClick={handleWarningCancel}
              >
                Cancel
              </Button>
              <Button
                variant='solid'
                color='primary'
                onClick={handleWarningConfirm}
              >
                Continue
              </Button>
            </div>
          </ModalDialog>
        </Modal>
      </>
    );
  },
);

ColumnFormFields.displayName = 'ColumnFormFields';

ColumnFormFields.propTypes = {
  editedItem: PropTypes.shape({
    label: PropTypes.string,
    entity: PropTypes.object,
    property: PropTypes.object,
    externalUrl: PropTypes.string,
  }).isRequired,
  setEditedItem: PropTypes.func.isRequired,
  isIFrame: PropTypes.bool.isRequired,
  setIsIFrame: PropTypes.func.isRequired,
  setIsWaitingForIframeData: PropTypes.func.isRequired,
};

export default ColumnFormFields;
