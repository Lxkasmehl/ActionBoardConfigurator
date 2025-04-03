import PropTypes from 'prop-types';
import { FormControl, FormLabel, Input, Switch, Typography } from '@mui/joy';
import useFetchEntities from '../../../../shared/hooks/useFetchEntities';
import { sortEntities } from '../../../../shared/utils/entityOperations';
import { useSelector } from 'react-redux';
import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import EntityPropertyFields from './EntityPropertyFields';

const ColumnFormFields = forwardRef(
  ({ editedItem, setEditedItem, isIFrame, setIsIFrame }, ref) => {
    const filteredEntities = useSelector(
      (state) => state.fetchedData.filteredEntities,
    );
    const sortedEntities = useMemo(
      () => sortEntities(filteredEntities),
      [filteredEntities],
    );
    const loading = useFetchEntities();
    const iframeRef = useRef(null);
    const [iframeData, setIframeData] = useState(null);

    useEffect(() => {
      const handleMessage = (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'IFRAME_DATA_RESPONSE') {
          setIframeData(event.data.payload);
          console.log('event.data.payload', event.data.payload);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [setEditedItem]);

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

            {iframeData && (
              <div style={{ marginTop: '10px' }}>
                <h4>Received Data:</h4>
                <pre>{JSON.stringify(iframeData, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
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
};

export default ColumnFormFields;
