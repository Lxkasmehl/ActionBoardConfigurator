import { useState } from 'react';
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

import { selectPropertyOptions } from '../redux/selectors/entitySelectors';
import { removeEntityConfig, removeFormData } from '../redux/entitiesSlice';
import { useEntityChangeHandler } from '../hooks/useEntityChangeHandler';
import { useModalState } from '../hooks/useModalState';
import { useSelectedPropertyChangeHandler } from '../hooks/useSelectedPropertyChangeHandler';
import {
  sortEntities,
  sortProperties,
  filterUniqueProperties,
} from '../utils/entityUtils';

import FilterModal from './FilterModal';
import PropertySelector from './PropertySelector';

import '@xyflow/react/dist/style.css';

export default function EntitySection({ id }) {
  const [matchingEntitiesState, setMatchingEntitiesState] = useState([]);
  const [selectedPropertiesSectionState, setSelectedPropertiesSectionState] =
    useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [accordionSelectedProperties, setAccordionSelectedProperties] =
    useState({});

  const dispatch = useDispatch();
  const { isOpen, openModal, closeModal } = useModalState();

  const { setNodes, getEdges } = useReactFlow();
  const edges = getEdges();
  const isTargetOfEdge = edges.some((edge) => edge.target === id);

  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
  const config = useSelector((state) => state.entities.config);
  const formData = useSelector((state) => state.entities.formData);
  const selectedEntities = useSelector(
    (state) => state.entities.selectedEntities,
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
  );

  const handleRemove = () => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
    dispatch(removeEntityConfig(id));
    dispatch(removeFormData({ id }));
    console.log(config);
  };

  const toggleSelectAll = (event) => {
    const checked = event.target.checked;
    setIsChecked(checked);
    if (checked) {
      setSelectedPropertiesSectionState(
        uniqueSortedPropertyOptions.map((option) => option.Name),
      );
      handleSelectedPropertyChange(
        'mainAutocomplete',
        event,
        uniqueSortedPropertyOptions,
      );
    } else {
      setSelectedPropertiesSectionState([]);
      handleSelectedPropertyChange('mainAutocomplete', event, []);
    }
  };

  const toggleAccordionSelectAll = (entity, event) => {
    const checked = event.target.checked;
    setAccordionSelectedProperties((prev) => ({
      ...prev,
      [entity.propertyPath]: checked,
    }));
    const properties = [
      ...entity.matchingEntity.properties.properties,
      ...entity.matchingEntity.properties.navigationProperties,
    ];
    if (checked) {
      setAccordionSelectedProperties((prev) => ({
        ...prev,
        [entity.propertyPath]: properties,
      }));
      handleSelectedPropertyChange(entity.propertyPath, event, properties);
    } else {
      setAccordionSelectedProperties((prev) => ({
        ...prev,
        [entity.propertyPath]: [],
      }));
      handleSelectedPropertyChange(entity.propertyPath, event, []);
    }
  };

  return (
    <div>
      <Card
        color={isTargetOfEdge ? 'primary' : 'neutral'}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minWidth: '40em',
          maxWidth: '760px',
          width: 'auto',
          padding: 3,
        }}
      >
        <div className='flex flex-row gap-6 items-center'>
          <Autocomplete
            options={sortedEntities}
            groupBy={(option) =>
              (option['sap:label'] || option.name || '').charAt(0).toUpperCase()
            }
            getOptionLabel={(option) => option['sap:label'] || option.name}
            placeholder='Select an entity'
            onChange={handleEntityChange}
            isOptionEqualToValue={(option, value) => option.name === value.name}
            sx={{ width: '14rem', height: 'fit-content' }}
          />
          <div className='flex items-center'>
            <Button
              color='neutral'
              variant='outlined'
              onClick={openModal}
              disabled={!selectedEntity}
            >
              {!formData[id] ? 'Add Filter' : 'Edit Filter'}
            </Button>
          </div>

          <div className='flex items-center flex-col gap-2'>
            <PropertySelector
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
              onSelectAllChange={toggleSelectAll}
              isChecked={isChecked}
              label='Select all properties you want to display'
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
              justifyContent: 'space-between',
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
                key={entity.propertyPath}
                sx={{ height: 'fit-content' }}
              >
                <AccordionSummary>{entity.propertyPath}</AccordionSummary>
                <AccordionDetails>
                  <PropertySelector
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
                    onSelectAllChange={(event) =>
                      toggleAccordionSelectAll(entity, event)
                    }
                    isChecked={
                      accordionSelectedProperties[entity.propertyPath]
                        ?.length ===
                      [
                        ...entity.matchingEntity.properties.properties,
                        ...entity.matchingEntity.properties
                          .navigationProperties,
                      ].length
                    }
                    label='Select all properties you want to display'
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
          position={Position.Right}
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
};
