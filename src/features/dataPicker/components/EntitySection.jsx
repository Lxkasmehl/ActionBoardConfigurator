import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AccordionGroup,
  accordionClasses,
  Autocomplete,
  Button,
  Card,
  IconButton,
} from '@mui/joy';
import RemoveIcon from '@mui/icons-material/Remove';
import { Handle, Position, useReactFlow } from '@xyflow/react';

import { selectPropertyOptions } from '../../../redux/selectors/entitySelectors';
import { removeEntityConfig } from '../../../redux/configSlice';
import {
  removeFormData,
  setSelectedPropertiesInAccordions,
} from '../../../redux/dataPickerSlice';
import { useEntityChangeHandler } from '../hooks/useEntityChangeHandler';
import { useModalState } from '../hooks/useModalState';
import { useSelectedPropertyChangeHandler } from '../hooks/useSelectedPropertyChangeHandler';
import {
  sortEntities,
  sortProperties,
  filterUniqueProperties,
} from '../../../shared/utils/entityOperations';

import FilterModal from './FilterModal';
import PropertySelector from './PropertySelector';

import '@xyflow/react/dist/style.css';

export default function EntitySection({ id, data }) {
  const config = useSelector((state) => state.config.config);
  const matchingEntitiesForAccordions = useSelector(
    (state) => state.dataPicker.matchingEntitiesForAccordions,
  );

  const [matchingEntitiesState, setMatchingEntitiesState] = useState(
    matchingEntitiesForAccordions[id] || [],
  );

  const [selectedPropertiesSectionState, setSelectedPropertiesSectionState] =
    useState(
      Object.values(config[id] || {})
        .find((obj) => obj?.selectedProperties)
        ?.selectedProperties?.filter((prop) => !prop.includes('/')) || [],
    );

  const selectedPropertiesInAccordions = useSelector(
    (state) => state.dataPicker.selectedPropertiesInAccordions,
  );

  const [accordionSelectedProperties, setAccordionSelectedProperties] =
    useState(selectedPropertiesInAccordions[id] || {});

  const dispatch = useDispatch();
  const { isOpen, openModal, closeModal } = useModalState();

  const { setNodes, getEdges } = useReactFlow();
  const edges = getEdges();
  const isTargetOfEdge = edges.some((edge) => edge.target === id);

  const filteredEntities = useSelector(
    (state) => state.fetchedData.filteredEntities,
  );
  const formData = useSelector((state) => state.dataPicker.formData);
  const selectedEntities = useSelector(
    (state) => state.dataPicker.selectedEntities,
  );
  const selectedEntity = selectedEntities[id];
  const propertyOptions = useSelector((state) =>
    selectPropertyOptions(state, id),
  );

  const sortedEntities = sortEntities(filteredEntities);
  const sortedPropertyOptions = sortProperties(propertyOptions);
  const uniqueSortedPropertyOptions = filterUniqueProperties(
    sortedPropertyOptions,
  );

  useEffect(() => {
    dispatch(
      setSelectedPropertiesInAccordions({
        id,
        accordionSelectedProperties,
      }),
    );
  }, [dispatch, id, accordionSelectedProperties]);

  const handleEntityChange = useEntityChangeHandler(
    id,
    filteredEntities,
    selectedEntity,
    isTargetOfEdge,
    setMatchingEntitiesState,
    setSelectedPropertiesSectionState,
  );

  const handleSelectedPropertyChange = useSelectedPropertyChangeHandler(
    isTargetOfEdge,
    id,
    setMatchingEntitiesState,
    matchingEntitiesState,
    setAccordionSelectedProperties,
    accordionSelectedProperties,
  );

  const handleRemove = () => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
    dispatch(
      removeEntityConfig({ id, entityName: selectedEntity?.name || '' }),
    );
    dispatch(removeFormData({ id }));
    console.log(config);
  };

  return (
    <div>
      <Card
        data-testid='entity-section'
        color={data.selected ? 'primary' : 'neutral'}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minWidth: '600px',
          maxWidth: '780px',
          width: 'auto',
          padding: 3,
          border: isTargetOfEdge && '2px solid',
          boxShadow: isTargetOfEdge ? '0 0 8px rgba(0, 0, 0, 0.2)' : 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 12px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          <Autocomplete
            data-testid='entity-autocomplete'
            options={sortedEntities}
            groupBy={(option) => (option.name || '').charAt(0).toUpperCase()}
            getOptionLabel={(option) => option?.name || option || ''}
            placeholder='Select an entity'
            onChange={handleEntityChange}
            isOptionEqualToValue={(option, value) => {
              if (!option || !value) return false;
              return option.name === value || option?.name === value?.name;
            }}
            value={selectedEntity}
            sx={{ width: '14rem', height: 'fit-content' }}
          />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              data-testid='add-filter-button'
              color='neutral'
              variant='outlined'
              onClick={openModal}
              disabled={!selectedEntity}
            >
              {!formData[id] ? 'Add Filter' : 'Edit Filter'}
            </Button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <PropertySelector
              data-testid='property-selector'
              options={uniqueSortedPropertyOptions}
              selectedOptions={selectedPropertiesSectionState.map((name) =>
                uniqueSortedPropertyOptions.find(
                  (option) => option.Name === name,
                ),
              )}
              onChange={(event, newValue) => {
                setSelectedPropertiesSectionState(
                  newValue.map((option) => option.Name),
                );
                handleSelectedPropertyChange(
                  'mainAutocomplete',
                  event,
                  newValue,
                );
              }}
              placeholder='Select a property'
              groupBy={(option) => option.Name.charAt(0).toUpperCase()}
              getOptionLabel={(option) => (option ? option.Name : '')}
              limitTags={2}
              disabled={!selectedEntity}
              sx={{ width: '14rem' }}
            />
          </div>
        </div>

        {matchingEntitiesState.length > 0 && (
          <AccordionGroup
            disableDivider
            sx={(theme) => ({
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '1rem',
              [`& .${accordionClasses.root}`]: {
                marginTop: '0.5rem',
                transition: '0.2s ease',
                '& button:not([aria-expanded="true"])': {
                  transition: '0.2s ease',
                  paddingBottom: '0.625rem',
                },
                '& button:hover': {
                  background: 'transparent',
                },
              },
              [`& .${accordionClasses.root}.${accordionClasses.expanded}`]: {
                bgcolor: 'background.level1',
                borderRadius: 'md',
                borderBottom: '1px solid',
                borderColor: 'background.level2',
              },
              '& [aria-expanded="true"]': {
                boxShadow: `inset 0 -1px 0 ${theme.vars.palette.divider}`,
              },
            })}
          >
            {matchingEntitiesState.map((entity) => (
              <Accordion
                data-testid={`accordion-${entity.propertyPath}`}
                key={entity.propertyPath}
                sx={{ height: 'fit-content' }}
              >
                <AccordionSummary
                  sx={{
                    maxWidth: '232px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word',
                    hyphens: 'auto',
                  }}
                >
                  {entity.propertyPath}
                </AccordionSummary>
                <AccordionDetails>
                  <PropertySelector
                    data-testid={`accordion-${entity.propertyPath}-property-selector`}
                    options={[
                      ...entity.matchingEntity.properties.properties,
                      ...entity.matchingEntity.properties.navigationProperties,
                    ].sort((a, b) => a.Name.localeCompare(b.Name))}
                    selectedOptions={
                      accordionSelectedProperties[entity.propertyPath] || []
                    }
                    onChange={(event, newValue) => {
                      setAccordionSelectedProperties((prev) => ({
                        ...prev,
                        [entity.propertyPath]: newValue,
                      }));
                      handleSelectedPropertyChange(
                        entity.propertyPath,
                        event,
                        newValue,
                      );
                    }}
                    placeholder='Select a property'
                    groupBy={(option) => option.Name.charAt(0).toUpperCase()}
                    getOptionLabel={(option) => option.Name}
                    limitTags={2}
                    disabled={!selectedEntity}
                    sx={{ marginTop: 1, width: '13rem' }}
                  />
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionGroup>
        )}

        <Handle
          type='source'
          position={Position.Bottom}
          style={{
            width: '30px',
            height: '30px',
            color: 'white',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          OK
        </Handle>
        <Handle
          type='target'
          position={Position.Top}
          style={{
            width: '30px',
            height: '30px',
            color: 'black',
            backgroundColor: 'white',
            border: '1px solid black',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          IN
        </Handle>
      </Card>
      <IconButton
        onClick={handleRemove}
        variant='outlined'
        color='danger'
        sx={{
          position: 'absolute',
          left: '-60px',
          top: 'calc(50% - 18px)',
        }}
      >
        <RemoveIcon />
      </IconButton>
      <FilterModal
        open={isOpen}
        onClose={closeModal}
        entity={selectedEntity}
        id={id}
      />
    </div>
  );
}

EntitySection.propTypes = {
  id: PropTypes.number.isRequired,
  data: PropTypes.shape({
    selected: PropTypes.bool,
  }),
};
