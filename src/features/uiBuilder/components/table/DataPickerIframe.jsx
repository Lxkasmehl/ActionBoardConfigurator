import PropTypes from 'prop-types';
import { Typography } from '@mui/joy';
import { useRef } from 'react';

const DataPickerIframe = ({ onWarning, onDataFetch }) => {
  const iframeRef = useRef(null);

  const handleMessage = (event) => {
    if (event.origin !== window.location.origin) return;

    if (event.data.type === 'IFRAME_WARNING') {
      onWarning(event.data.payload.message);
    }
  };

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

  return (
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
  );
};

DataPickerIframe.propTypes = {
  onWarning: PropTypes.func.isRequired,
  onDataFetch: PropTypes.func.isRequired,
};

export default DataPickerIframe;
