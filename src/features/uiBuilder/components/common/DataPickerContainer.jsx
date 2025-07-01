import PropTypes from 'prop-types';
import { Typography, Card } from '@mui/joy';
import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setDataPickerSelectedEntity,
  setDataPickerWarning,
} from '@/redux/dataPickerSlice';
import DataPicker from '@/features/dataPicker/components/DataPicker';

const DataPickerContainer = ({
  onWarning,
  onDataFetch,
  onEntitySelected,
  titleText,
}) => {
  const cardRef = useRef(null);
  const dispatch = useDispatch();

  const {
    selectedEntity,
    dataPickerResults,
    dataPickerConfigEntries,
    dataPickerWarning,
  } = useSelector((state) => state.dataPicker);

  useEffect(() => {
    if (dataPickerWarning) {
      onWarning(dataPickerWarning);
      dispatch(setDataPickerWarning(null));
    }
  }, [dataPickerWarning, onWarning, dispatch]);

  useEffect(() => {
    if (dataPickerResults && dataPickerConfigEntries) {
      onDataFetch({
        results: dataPickerResults,
        configEntries: dataPickerConfigEntries,
      });
      // Don't clear the state here - let the parent component handle it
      // dispatch(clearDataPickerState());
    }
  }, [dataPickerResults, dataPickerConfigEntries, onDataFetch, dispatch]);

  useEffect(() => {
    if (selectedEntity) {
      onEntitySelected({
        entity: selectedEntity,
        isNewColumn: false,
      });
      dispatch(setDataPickerSelectedEntity(null));
    }
  }, [selectedEntity, onEntitySelected, dispatch]);

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
        data-testid='data-picker-container'
        ref={cardRef}
        sx={{
          width: '80vw',
          height: '45vh',
          borderRadius: '8px',
          border: '1px solid #ced8e2',
        }}
      >
        <DataPicker containerRef={cardRef} />
      </Card>
    </div>
  );
};

DataPickerContainer.propTypes = {
  onWarning: PropTypes.func.isRequired,
  onDataFetch: PropTypes.func.isRequired,
  onEntitySelected: PropTypes.func.isRequired,
  titleText: PropTypes.string.isRequired,
};

export default DataPickerContainer;
