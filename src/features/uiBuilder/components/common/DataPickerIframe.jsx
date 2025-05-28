import PropTypes from 'prop-types';
import { Typography } from '@mui/joy';
import { useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addEntity,
  setEntityFilter,
  setPropertySelection,
} from '@/redux/configSlice';
import {
  setEdgesForFlow,
  setPropertyOptions,
  setPropertiesBySection,
  setMatchingEntitiesForAccordions,
  setSelectedPropertiesInAccordions,
  setConditionsForFilterModal,
  setFormData,
} from '@/redux/dataPickerSlice';

const DataPickerIframe = ({
  onWarning,
  onDataFetch,
  onEntitySelected,
  titleText,
}) => {
  const iframeRef = useRef(null);
  const dispatch = useDispatch();
  const store = useSelector((state) => state);

  const filteredEntities = useSelector(
    (state) => state.fetchedData.filteredEntities,
  );

  // Send initial state to iframe after it loads
  useEffect(() => {
    const iframe = iframeRef.current;
    const handleIframeLoad = () => {
      if (iframe) {
        iframe.contentWindow.postMessage(
          {
            type: 'INIT_IFRAME_STATE',
            payload: {
              config: store.config,
              dataPicker: store.dataPicker,
              fetchedData: store.fetchedData,
            },
          },
          window.location.origin,
        );
      }
    };

    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, [store]);

  const handleMessage = useCallback(
    (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'IFRAME_WARNING') {
        onWarning(event.data.payload.message);
      } else if (event.data.type === 'IFRAME_DATA_RESPONSE') {
        onDataFetch({
          results: event.data.payload.results,
          configEntries: event.data.payload.configEntries,
        });
      } else if (event.data.type === 'SELECTED_NODE_CHANGED') {
        const { selectedEntity } = event.data.payload;
        const completeEntity = filteredEntities?.find(
          (entity) => entity.name === selectedEntity,
        );

        if (selectedEntity && completeEntity) {
          onEntitySelected({
            entity: completeEntity,
            isNewColumn: false,
          });
        }
      } else if (event.data.type === 'DATAPICKER_STATE_SAVED') {
        try {
          // Update parent's localStorage
          localStorage.setItem('dataPickerState', event.data.payload);

          // Parse the saved state
          const savedState = JSON.parse(event.data.payload);

          // Update config state
          Object.entries(savedState.config).forEach(([nodeId, nodeConfig]) => {
            Object.entries(nodeConfig).forEach(([entityName, entityConfig]) => {
              // Add entity if it doesn't exist
              dispatch(addEntity({ id: nodeId, entityName }));

              // Set property selection
              if (entityConfig.selectedProperties) {
                dispatch(
                  setPropertySelection({
                    id: nodeId,
                    entityName,
                    propertyNames: entityConfig.selectedProperties,
                  }),
                );
              }

              // Set entity filter
              if (entityConfig.filter) {
                dispatch(
                  setEntityFilter({
                    id: nodeId,
                    entityName,
                    filterObject: entityConfig.filter,
                  }),
                );
              }
            });
          });

          // Update dataPicker state
          if (savedState.propertyOptions) {
            Object.entries(savedState.propertyOptions).forEach(
              ([id, properties]) => {
                dispatch(setPropertyOptions({ id, properties }));
              },
            );
          }

          if (savedState.propertiesBySection) {
            Object.entries(savedState.propertiesBySection).forEach(
              ([id, properties]) => {
                dispatch(
                  setPropertiesBySection({
                    id,
                    propertiesBySection: properties,
                  }),
                );
              },
            );
          }

          if (savedState.matchingEntitiesForAccordions) {
            Object.entries(savedState.matchingEntitiesForAccordions).forEach(
              ([id, entities]) => {
                dispatch(
                  setMatchingEntitiesForAccordions({
                    id,
                    matchingEntities: entities,
                  }),
                );
              },
            );
          }

          if (savedState.selectedPropertiesInAccordions) {
            Object.entries(savedState.selectedPropertiesInAccordions).forEach(
              ([id, properties]) => {
                dispatch(
                  setSelectedPropertiesInAccordions({
                    id,
                    accordionSelectedProperties: properties,
                  }),
                );
              },
            );
          }

          if (savedState.conditionsForFilterModal) {
            Object.entries(savedState.conditionsForFilterModal).forEach(
              ([id, conditions]) => {
                dispatch(setConditionsForFilterModal({ id, conditions }));
              },
            );
          }

          if (savedState.formData) {
            Object.entries(savedState.formData).forEach(([id, formObject]) => {
              dispatch(setFormData({ id, formObject }));
            });
          }

          if (savedState.edgesForFlow) {
            dispatch(setEdgesForFlow(savedState.edgesForFlow));
          }
        } catch (error) {
          console.error('Error updating parent state:', error);
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
        data-testid='data-picker-iframe'
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
