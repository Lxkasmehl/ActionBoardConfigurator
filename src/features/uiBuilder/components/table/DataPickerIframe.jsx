import PropTypes from 'prop-types';
import { Typography } from '@mui/joy';
import { useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setSelectedEntity,
  setSelectedProperties,
  setFilterStorageForNodesNotConnectedToEdges,
  setEdgesForFlow,
} from '@/redux/dataPickerSlice';
import {
  addEntity,
  setEntityFilter,
  setPropertySelection,
} from '@/redux/configSlice';

const DataPickerIframe = ({
  onWarning,
  onDataFetch,
  onEntitySelected,
  titleText,
}) => {
  const iframeRef = useRef(null);
  const dispatch = useDispatch();

  const filteredEntities = useSelector(
    (state) => state.fetchedData.filteredEntities,
  );

  const handleMessage = useCallback(
    (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'IFRAME_WARNING') {
        onWarning(event.data.payload.message);
      } else if (event.data.type === 'IFRAME_DATA_RESPONSE') {
        onDataFetch(event.data.payload);
      } else if (event.data.type === 'SELECTED_NODE_CHANGED') {
        const { selectedEntity } = event.data.payload;
        const completeEntity = filteredEntities.find(
          (entity) => entity.name === selectedEntity,
        );

        if (selectedEntity && completeEntity) {
          onEntitySelected({
            entity: completeEntity,
            isNewColumn: false,
          });
        }
      } else if (event.data.type === 'DATAPICKER_STATE_UPDATE') {
        const { payload } = event.data;
        // Update Redux state with the received state
        if (payload.selectedEntities) {
          Object.entries(payload.selectedEntities).forEach(
            ([id, entityName]) => {
              dispatch(setSelectedEntity({ id, entityName }));
            },
          );
        }
        dispatch(setSelectedProperties(payload.selectedProperties));
        dispatch(
          setFilterStorageForNodesNotConnectedToEdges(
            payload.filterStorageForNodesNotConnectedToEdges,
          ),
        );
        dispatch(setEdgesForFlow(payload.edgesForFlow));

        // Update config state using the available actions
        if (payload.config) {
          Object.entries(payload.config).forEach(([id, entityConfig]) => {
            Object.entries(entityConfig).forEach(([entityName, config]) => {
              dispatch(addEntity({ id, entityName }));
              if (config.filter) {
                dispatch(
                  setEntityFilter({
                    id,
                    entityName,
                    filterObject: config.filter,
                  }),
                );
              }
              if (config.selectedProperties) {
                dispatch(
                  setPropertySelection({
                    id,
                    entityName,
                    propertyNames: config.selectedProperties,
                  }),
                );
              }
            });
          });
        }
      }
    },
    [onWarning, onDataFetch, onEntitySelected, filteredEntities, dispatch],
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
        backend result in the {titleText}
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
  onEntitySelected: PropTypes.func.isRequired,
  titleText: PropTypes.string.isRequired,
};

export default DataPickerIframe;
