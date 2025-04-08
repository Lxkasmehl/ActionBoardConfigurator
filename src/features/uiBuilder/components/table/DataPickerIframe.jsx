import PropTypes from 'prop-types';
import { Typography } from '@mui/joy';
import { useRef, useEffect, useCallback } from 'react';

const DataPickerIframe = ({ onWarning, onDataFetch }) => {
  const iframeRef = useRef(null);

  const handleMessage = useCallback(
    (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'IFRAME_WARNING') {
        onWarning(event.data.payload.message);
      } else if (event.data.type === 'IFRAME_DATA_RESPONSE') {
        onDataFetch(event.data.payload);
      }
    },
    [onWarning, onDataFetch],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const triggerDataFetch = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'FETCH_DATA_REQUEST',
        },
        window.location.origin,
      );
    }
  };

  // Expose triggerDataFetch to parent component
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.triggerDataFetch = triggerDataFetch;
    }
  }, []);

  return (
    <div className='flex justify-center items-center flex-col mt-3'>
      <Typography
        level='title-md'
        sx={{ textAlign: 'center', marginBottom: 2, maxWidth: '500px' }}
      >
        Select a node in the DataPicker Flow to display its corresponding
        backend result in the table column
      </Typography>
      <iframe
        ref={iframeRef}
        src='/data-picker'
        style={{
          width: '80vw',
          height: '45vh',
          borderRadius: '8px',
          border: '1px solid #ced8e2',
        }}
      />
    </div>
  );
};

DataPickerIframe.propTypes = {
  onWarning: PropTypes.func.isRequired,
  onDataFetch: PropTypes.func.isRequired,
};

export default DataPickerIframe;
