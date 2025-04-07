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
  Checkbox,
  Autocomplete,
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
      mainEntity,
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
    const [relationOptions, setRelationOptions] = useState([]);
    const [selectedMainEntityProp, setSelectedMainEntityProp] = useState('');
    const [selectedCurrentEntityProp, setSelectedCurrentEntityProp] =
      useState('');
    const [customRelationModal, setCustomRelationModal] = useState(null);

    const isInvalid = useMemo(() => {
      if (!editedItem.entity || !mainEntity) return false;

      // If it's the main entity or has a valid relation, it's valid
      if (editedItem.isMainEntity || editedItem.relation) return false;

      // Otherwise, it's invalid if the entities don't match
      return editedItem.entity.name !== mainEntity.name;
    }, [
      editedItem.entity,
      editedItem.isMainEntity,
      editedItem.relation,
      mainEntity,
    ]);

    useEffect(() => {
      if (
        editedItem.entity &&
        mainEntity &&
        editedItem.entity.name !== mainEntity.name
      ) {
        // Find navigation properties that could relate to the main entity
        const mainEntityProps =
          mainEntity.properties?.navigationProperties || [];
        const currentEntityProps =
          editedItem.entity.properties?.navigationProperties || [];

        const relations = [];

        // Check if main entity has a navigation property to current entity
        mainEntityProps.forEach((prop) => {
          if (prop.Type === editedItem.entity.name) {
            relations.push({
              type: 'main_to_current',
              property: prop,
              label: `${mainEntity.name} -> ${prop.Name} -> ${editedItem.entity.name}`,
            });
          }
        });

        // Check if current entity has a navigation property to main entity
        currentEntityProps.forEach((prop) => {
          if (prop.Type === mainEntity.name) {
            relations.push({
              type: 'current_to_main',
              property: prop,
              label: `${editedItem.entity.name} -> ${prop.Name} -> ${mainEntity.name}`,
            });
          }
        });

        // Also check for properties that might indicate a relationship
        const mainEntityRegularProps = mainEntity.properties?.properties || [];
        const currentEntityRegularProps =
          editedItem.entity.properties?.properties || [];

        // Check if main entity has a property that matches current entity's name
        mainEntityRegularProps.forEach((prop) => {
          if (
            prop.Type === 'Edm.String' &&
            prop.Name.toLowerCase().includes(
              editedItem.entity.name.toLowerCase(),
            )
          ) {
            relations.push({
              type: 'main_to_current_property',
              property: prop,
              label: `${mainEntity.name} -> ${prop.Name} -> ${editedItem.entity.name}`,
            });
          }
        });

        // Check if current entity has a property that matches main entity's name
        currentEntityRegularProps.forEach((prop) => {
          if (
            prop.Type === 'Edm.String' &&
            prop.Name.toLowerCase().includes(mainEntity.name.toLowerCase())
          ) {
            relations.push({
              type: 'current_to_main_property',
              property: prop,
              label: `${editedItem.entity.name} -> ${prop.Name} -> ${mainEntity.name}`,
            });
          }
        });

        setRelationOptions(relations);
      }
    }, [editedItem.entity, mainEntity, editedItem.relation]);

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

    const handleCustomRelation = () => {
      if (!selectedMainEntityProp || !selectedCurrentEntityProp) {
        setWarningMessage('Please select both properties');
        setShowWarningModal(true);
        return;
      }

      const customRelation = {
        name: `Custom_${selectedMainEntityProp}_${selectedCurrentEntityProp}`,
        mainEntityProperty: selectedMainEntityProp,
        currentEntityProperty: selectedCurrentEntityProp,
      };

      setEditedItem((prev) => ({
        ...prev,
        relation: customRelation,
      }));

      setCustomRelationModal(null);
    };

    const handleRelationChange = (event, newValue) => {
      if (newValue === 'custom') {
        setCustomRelationModal({
          mainEntity,
          currentEntity: editedItem.entity,
        });
      } else {
        setEditedItem((prev) => ({
          ...prev,
          relation: newValue,
        }));
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
          <>
            <EntityPropertyFields
              editedItem={editedItem}
              setEditedItem={setEditedItem}
              sortedEntities={sortedEntities}
              loading={loading}
            />
            {editedItem.entity &&
              mainEntity &&
              editedItem.entity.name !== mainEntity.name && (
                <FormControl sx={{ mt: 2 }}>
                  <FormLabel>Relationship to Main Entity</FormLabel>
                  <div className='flex gap-2 items-center'>
                    <Autocomplete
                      value={editedItem.relation || null}
                      onChange={handleRelationChange}
                      options={relationOptions}
                      getOptionLabel={(option) => option?.label || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.type === value?.type &&
                        option?.property?.Name === value?.property?.Name
                      }
                      placeholder='Select or define a relationship'
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant='plain'
                      size='sm'
                      onClick={() => {
                        const mainEntityProps =
                          mainEntity.properties?.properties || [];
                        const currentEntityProps =
                          editedItem.entity.properties?.properties || [];

                        console.log('mainEntityProps', mainEntityProps);
                        console.log('currentEntityProps', currentEntityProps);

                        setCustomRelationModal(
                          <Modal
                            open={true}
                            onClose={() => setCustomRelationModal(null)}
                          >
                            <ModalDialog>
                              <Typography level='h4'>
                                Define Custom Relationship
                              </Typography>
                              <FormControl sx={{ mt: 2 }}>
                                <FormLabel>Main Entity Property</FormLabel>
                                <Autocomplete
                                  value={selectedMainEntityProp || null}
                                  options={mainEntityProps}
                                  placeholder='Select property from main entity'
                                  onChange={(_, value) =>
                                    setSelectedMainEntityProp(value)
                                  }
                                  getOptionLabel={(option) => option.Name}
                                  isOptionEqualToValue={(option, value) =>
                                    option?.Name === value?.Name
                                  }
                                />
                              </FormControl>
                              <FormControl sx={{ mt: 2 }}>
                                <FormLabel>Current Entity Property</FormLabel>
                                <Autocomplete
                                  value={selectedCurrentEntityProp || null}
                                  options={currentEntityProps}
                                  placeholder='Select property from current entity'
                                  onChange={(_, value) =>
                                    setSelectedCurrentEntityProp(value)
                                  }
                                  getOptionLabel={(option) => option.Name}
                                  isOptionEqualToValue={(option, value) =>
                                    option?.Name === value?.Name
                                  }
                                />
                              </FormControl>
                              <div className='flex justify-end gap-2 mt-4'>
                                <Button
                                  variant='plain'
                                  color='neutral'
                                  onClick={() => setCustomRelationModal(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant='solid'
                                  color='primary'
                                  onClick={handleCustomRelation}
                                >
                                  Save
                                </Button>
                              </div>
                            </ModalDialog>
                          </Modal>,
                        );
                      }}
                    >
                      Define Custom
                    </Button>
                  </div>
                  {editedItem.relation && (
                    <Typography color='success' level='body-sm' sx={{ mt: 1 }}>
                      Selected relationship: {editedItem.relation.label}
                    </Typography>
                  )}
                </FormControl>
              )}
          </>
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

        <Checkbox
          color='neutral'
          label='Make Main Entity'
          size='md'
          variant='outlined'
          checked={editedItem.isMainEntity || false}
          onChange={(e) => {
            setEditedItem({
              ...editedItem,
              isMainEntity: e.target.checked,
              relation: null, // Clear relation if making main entity
            });
          }}
          disabled={!isIFrame && !editedItem.entity}
          sx={{ marginTop: 2, alignSelf: 'center' }}
        />

        {isInvalid && (
          <Typography
            color='danger'
            level='body-sm'
            sx={{ mt: 1, maxWidth: '400px' }}
          >
            This column&apos;s entity ({editedItem.entity.name}) does not match
            the main entity ({mainEntity.name}). Either make it the main entity,
            choose a different entity, or define a relationship between the
            entities.
          </Typography>
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

        {customRelationModal}
      </>
    );
  },
);

ColumnFormFields.displayName = 'ColumnFormFields';

ColumnFormFields.propTypes = {
  editedItem: PropTypes.shape({
    label: PropTypes.string,
    entity: PropTypes.shape({
      name: PropTypes.string,
      properties: PropTypes.shape({
        properties: PropTypes.array,
        navigationProperties: PropTypes.array,
      }),
    }),
    property: PropTypes.object,
    externalUrl: PropTypes.string,
    isMainEntity: PropTypes.bool,
    relation: PropTypes.object,
  }).isRequired,
  setEditedItem: PropTypes.func.isRequired,
  isIFrame: PropTypes.bool.isRequired,
  setIsIFrame: PropTypes.func.isRequired,
  setIsWaitingForIframeData: PropTypes.func.isRequired,
  mainEntity: PropTypes.shape({
    name: PropTypes.string,
    properties: PropTypes.shape({
      properties: PropTypes.array,
      navigationProperties: PropTypes.array,
    }),
  }),
};

export default ColumnFormFields;
