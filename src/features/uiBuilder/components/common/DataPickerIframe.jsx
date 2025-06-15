import PropTypes from 'prop-types';
import { Card, Typography } from '@mui/joy';
import { useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import DataPicker from '../../../dataPicker/components/DataPicker';

const DataPickerIframe = ({
  onWarning,
  onDataFetch,
  onEntitySelected,
  titleText,
  triggerFetch,
}) => {
  const cardRef = useRef(null);
  const store = useSelector((state) => state);

  const handleNodeSelected = useCallback(
    (nodeId, selectedEntity) => {
      if (selectedEntity) {
        const completeEntity = store.fetchedData.filteredEntities?.find(
          (entity) => entity.name === selectedEntity,
        );

        if (completeEntity) {
          onEntitySelected({
            entity: completeEntity,
            isNewColumn: false,
          });
        }
      }
    },
    [store.fetchedData.filteredEntities, onEntitySelected],
  );

  const handleDataFetch = useCallback(
    (data) => {
      onDataFetch(data);
    },
    [onDataFetch],
  );

  const handleWarning = useCallback(
    (message) => {
      onWarning(message);
    },
    [onWarning],
  );

  return (
    <div className='flex justify-center items-center flex-col mt-3'>
      <Typography
        level='title-md'
        sx={{ textAlign: 'center', marginBottom: 2, maxWidth: '500px' }}
      >
        Select a node in the DataPicker Flow to display its corresponding
        backend result in the {titleText}
      </Typography>
      <Card
        ref={cardRef}
        sx={{
          width: '80vw',
          height: '45vh',
          borderRadius: '8px',
          border: '1px solid #ced8e2',
        }}
      >
        <DataPicker
          containerRef={cardRef}
          onNodeSelected={handleNodeSelected}
          onDataFetch={handleDataFetch}
          onWarning={handleWarning}
          triggerFetch={triggerFetch}
        />
      </Card>
    </div>
  );
};

DataPickerIframe.propTypes = {
  onWarning: PropTypes.func.isRequired,
  onDataFetch: PropTypes.func.isRequired,
  onEntitySelected: PropTypes.func.isRequired,
  titleText: PropTypes.string.isRequired,
  triggerFetch: PropTypes.bool,
};

export default DataPickerIframe;
