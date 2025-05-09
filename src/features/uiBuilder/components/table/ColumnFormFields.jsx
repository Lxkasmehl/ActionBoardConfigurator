import PropTypes from 'prop-types';
import {
  FormControl,
  FormLabel,
  Input,
  Switch,
  Typography,
  Checkbox,
  Autocomplete,
  Button,
} from '@mui/joy';
import useFetchEntities from '../../../../shared/hooks/useFetchEntities';
import { sortEntities } from '../../../../shared/utils/entityOperations';
import { useSelector } from 'react-redux';
import {
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from 'react';
import EntityPropertyFields from './EntityPropertyFields';
import WarningModal from './WarningModal';
import CustomRelationModal from './CustomRelationModal';
import DataPickerIframe from '../common/DataPickerIframe';

const ColumnFormFields = forwardRef(
  (
    {
      editedItem,
      setEditedItem,
      isIFrame,
      setIsIFrame,
      setIsWaitingForIframeData,
      mainEntity,
      isIframeValidationError,
      columnData,
      setColumnData,
      onSave,
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
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [relationOptions, setRelationOptions] = useState([]);
    const [selectedMainEntityProp, setSelectedMainEntityProp] = useState('');
    const [selectedCurrentEntityProp, setSelectedCurrentEntityProp] =
      useState('');
    const [showCustomRelationModal, setShowCustomRelationModal] =
      useState(false);

    const isInvalid = useMemo(() => {
      if (!editedItem.entity || !mainEntity) return false;
      if (editedItem.isMainEntity || editedItem.relation) return false;
      return editedItem.entity.name !== mainEntity.name;
    }, [
      editedItem.entity,
      editedItem.isMainEntity,
      editedItem.relation,
      mainEntity,
    ]);

    useEffect(() => {
      const currentEntity =
        isIframeValidationError && columnData
          ? columnData.entity
          : editedItem.entity;
      if (
        currentEntity &&
        mainEntity &&
        currentEntity.name !== mainEntity.name
      ) {
        const mainEntityProps =
          mainEntity.properties?.navigationProperties || [];
        const currentEntityProps =
          currentEntity.properties?.navigationProperties || [];
        const relations = [];

        mainEntityProps.forEach((prop) => {
          if (prop.Type === currentEntity.name) {
            relations.push({
              type: 'main_to_current',
              property: prop,
              label: `${mainEntity.name} -> ${prop.Name} -> ${currentEntity.name}`,
            });
          }
        });

        currentEntityProps.forEach((prop) => {
          if (prop.Type === mainEntity.name) {
            relations.push({
              type: 'current_to_main',
              property: prop,
              label: `${currentEntity.name} -> ${prop.Name} -> ${mainEntity.name}`,
            });
          }
        });

        const mainEntityRegularProps = mainEntity.properties?.properties || [];
        const currentEntityRegularProps =
          currentEntity.properties?.properties || [];

        mainEntityRegularProps.forEach((prop) => {
          if (
            prop.Type === 'Edm.String' &&
            prop.Name.toLowerCase().includes(currentEntity.name.toLowerCase())
          ) {
            relations.push({
              type: 'main_to_current_property',
              property: prop,
              label: `${mainEntity.name} -> ${prop.Name} -> ${currentEntity.name}`,
            });
          }
        });

        currentEntityRegularProps.forEach((prop) => {
          if (
            prop.Type === 'Edm.String' &&
            prop.Name.toLowerCase().includes(mainEntity.name.toLowerCase())
          ) {
            relations.push({
              type: 'current_to_main_property',
              property: prop,
              label: `${currentEntity.name} -> ${prop.Name} -> ${mainEntity.name}`,
            });
          }
        });

        setRelationOptions(relations);
      }
    }, [
      editedItem.entity,
      mainEntity,
      editedItem.relation,
      isIframeValidationError,
      columnData,
    ]);

    const handleWarningConfirm = () => {
      setShowWarningModal(false);
      setIsWaitingForIframeData(true);
    };

    const handleWarningCancel = () => {
      setIsWaitingForIframeData(false);
      setShowWarningModal(false);
    };

    const handleCustomRelation = () => {
      if (!selectedMainEntityProp || !selectedCurrentEntityProp) {
        setWarningMessage('Please select both properties');
        setShowWarningModal(true);
        return;
      }

      const currentEntity = isIframeValidationError
        ? columnData.entity
        : editedItem.entity;
      const customRelation = {
        name: `Custom_${selectedMainEntityProp.Name}_${selectedCurrentEntityProp.Name}`,
        mainEntityProperty: selectedMainEntityProp,
        currentEntityProperty: selectedCurrentEntityProp,
        label: `${currentEntity.name} (${selectedCurrentEntityProp.Name}) -> ${mainEntity.name} (${selectedMainEntityProp.Name})`,
      };

      if (isIframeValidationError) {
        setColumnData((prev) => ({
          ...prev,
          relation: customRelation,
        }));
      } else {
        setEditedItem((prev) => ({
          ...prev,
          relation: customRelation,
        }));
      }

      setShowCustomRelationModal(false);
    };

    const handleRelationChange = (event, newValue) => {
      if (newValue === 'custom') {
        setShowCustomRelationModal(true);
      } else {
        if (isIframeValidationError) {
          setColumnData((prev) => ({
            ...prev,
            relation: newValue,
          }));
        } else {
          setEditedItem((prev) => ({
            ...prev,
            relation: newValue,
          }));
        }
      }
    };

    const handleEntitySelected = useCallback(
      (data) => {
        if (isIframeValidationError) {
          setColumnData((prev) => ({
            ...prev,
            entity: data.entity,
            isNewColumn: data.isNewColumn,
          }));
        } else {
          setEditedItem((prev) => ({
            ...prev,
            entity: data.entity,
            isNewColumn: data.isNewColumn,
          }));
        }
      },
      [isIframeValidationError, setColumnData, setEditedItem],
    );

    useImperativeHandle(ref, () => ({
      triggerIframeDataFetch: () => {
        if (isIFrame) {
          const iframe = document.querySelector('iframe[src="/data-picker"]');
          if (iframe && iframe.triggerDataFetch) {
            iframe.triggerDataFetch();
          }
        }
      },
    }));

    return (
      <>
        <FormControl sx={{ maxWidth: '500px', width: '100%' }}>
          <FormLabel>Label</FormLabel>
          <Input
            value={editedItem.label || ''}
            onChange={(e) =>
              setEditedItem({ ...editedItem, label: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSave();
              } else if (e.key === ' ') {
                e.stopPropagation();
              }
            }}
            placeholder='Enter column label'
            data-testid='column-label-input'
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
              data-testid='data-picker-switch'
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
          </>
        ) : (
          <DataPickerIframe
            onWarning={(message) => {
              setWarningMessage(message);
              setShowWarningModal(true);
            }}
            onDataFetch={() => setIsWaitingForIframeData(true)}
            onEntitySelected={handleEntitySelected}
            titleText='table column'
          />
        )}
        {(editedItem.entity &&
          mainEntity &&
          editedItem?.entity?.name !== mainEntity?.name) ||
        isIframeValidationError ? (
          <FormControl sx={{ mt: 2, maxWidth: '500px' }}>
            <FormLabel>Relationship to Main Entity</FormLabel>
            <div className='flex gap-2 items-center'>
              <Autocomplete
                value={
                  isIframeValidationError && columnData
                    ? columnData.relation
                    : editedItem.relation || null
                }
                onChange={handleRelationChange}
                options={relationOptions}
                getOptionLabel={(option) => option?.label || ''}
                isOptionEqualToValue={(option, value) =>
                  option?.type === value?.type &&
                  option?.property?.Name === value?.property?.Name
                }
                placeholder='Select or define a relationship'
                sx={{ flex: 1 }}
                data-testid='relationship-select'
              />
              <Button
                variant='plain'
                size='sm'
                onClick={() => setShowCustomRelationModal(true)}
              >
                Define Custom
              </Button>
            </div>
            {(isIframeValidationError && columnData?.relation
              ? columnData.relation
              : editedItem.relation) && (
              <Typography color='success' level='body-sm' sx={{ mt: 1 }}>
                Selected relationship:{' '}
                {
                  (isIframeValidationError && columnData?.relation
                    ? columnData.relation
                    : editedItem.relation
                  ).label
                }
              </Typography>
            )}
          </FormControl>
        ) : null}
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
              relation: null,
            });
          }}
          disabled={!isIFrame && !editedItem.entity}
          sx={{ marginTop: 2, alignSelf: 'center' }}
          data-testid='main-entity-checkbox'
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

        <WarningModal
          open={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          message={warningMessage}
          onConfirm={handleWarningConfirm}
          onCancel={handleWarningCancel}
        />

        <CustomRelationModal
          open={showCustomRelationModal}
          onClose={() => setShowCustomRelationModal(false)}
          mainEntity={mainEntity}
          currentEntity={
            isIframeValidationError ? columnData.entity : editedItem.entity
          }
          onSave={handleCustomRelation}
          selectedMainEntityProp={selectedMainEntityProp}
          setSelectedMainEntityProp={setSelectedMainEntityProp}
          selectedCurrentEntityProp={selectedCurrentEntityProp}
          setSelectedCurrentEntityProp={setSelectedCurrentEntityProp}
        />
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
  isIframeValidationError: PropTypes.bool.isRequired,
  columnData: PropTypes.shape({
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
  }),
  setColumnData: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ColumnFormFields;
