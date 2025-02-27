import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import {
  addEntity,
  removeEntity,
  setPropertySelection,
  setPropertyOptions,
  removeFormData,
  removeEntityConfig,
  setSelectedEntity,
  setSelectedProperties,
} from '../redux/entitiesSlice';
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
  Tooltip,
} from '@mui/joy';
import FilterModal from './FilterModal';
import RemoveIcon from '@mui/icons-material/Remove';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function EntitySection({ id }) {
  const dispatch = useDispatch();

  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
  const allEntities = useSelector((state) => state.entities.allEntities);
  const config = useSelector((state) => state.entities.config);
  const formData = useSelector((state) => state.entities.formData);
  const selectedEntities = useSelector(
    (state) => state.entities.selectedEntities,
  );
  const selectedEntity = selectedEntities[id];

  const selectPropertyOptions = createSelector(
    (state) => state.entities.propertyOptions,
    (_, id) => id,
    (propertyOptions, id) => propertyOptions[id] || [],
  );

  const propertyOptions = useSelector((state) =>
    selectPropertyOptions(state, id),
  );

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [matchingEntitiesState, setMatchingEntitiesState] = useState([]);
  const [selectedPropertiesState, setSelectedPropertiesState] = useState({});

  const { setNodes, getEdges } = useReactFlow();

  const ref = useRef();

  const sortedEntities = [...filteredEntities].sort((a, b) => {
    const labelA = (a['sap:label'] || a.Name || '').toLowerCase();
    const labelB = (b['sap:label'] || b.Name || '').toLowerCase();
    return labelA.localeCompare(labelB);
  });

  const sortedPropertyOptions = [...propertyOptions].sort((a, b) => {
    const labelA = (a.Name || '').toLowerCase();
    const labelB = (b.Name || '').toLowerCase();
    return labelA.localeCompare(labelB);
  });

  const uniqueSortedPropertyOptions = sortedPropertyOptions.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t['sap:label'] === value['sap:label']),
  );

  const edges = getEdges();
  const isTargetOfEdge = edges.some((edge) => edge.target === id);

  const handleEntityChange = (_, newValue) => {
    if (!newValue) return;

    const entityName = newValue.name;

    const entity = filteredEntities.find((e) => e.name === entityName);
    const properties = entity
      ? Array.from(
          new Set(entity.properties.properties.map((p) => p.Name)),
        ).map((Name) =>
          entity.properties.properties.find((p) => p.Name === Name),
        )
      : [];

    const navigationProperties = entity
      ? Array.from(
          new Set(entity.properties.navigationProperties.map((p) => p.Name)),
        ).map((Name) =>
          entity.properties.navigationProperties.find((p) => p.Name === Name),
        )
      : [];

    const combinedProperties = [...properties, ...navigationProperties];

    // const toRoleSet = new Set(navigationProperties.map((prop) => prop.ToRole));
    // const matchingEntities = allEntities.filter((entity) =>
    //   toRoleSet.has(entity.name),
    // );

    if (isTargetOfEdge) {
      if (selectedEntity) {
        dispatch(removeEntity({ id, entityName: selectedEntity }));
      }
      dispatch(addEntity({ id, entityName }));
      dispatch(removeFormData({ id }));
    }

    dispatch(setPropertyOptions({ id, properties: combinedProperties }));
    dispatch(setSelectedEntity({ id, entityName }));

    setResetKey((prev) => prev + 1);

    console.log(config);
  };

  const handleSelectedPropertyChange = (autocompleteId, _, newValue) => {
    const newSelectedProperties = {
      ...selectedPropertiesState,
      [autocompleteId]: newValue.map((item) => item.Name),
    };
    setSelectedPropertiesState(newSelectedProperties);

    const allSelectedPropertyNames = Object.values(
      newSelectedProperties,
    ).flat();

    if (!newValue || !isTargetOfEdge) {
      dispatch(
        setSelectedProperties({ id, propertyNames: allSelectedPropertyNames }),
      );
    } else {
      dispatch(
        setPropertySelection({
          entityName: selectedEntity,
          propertyNames: allSelectedPropertyNames,
          id,
        }),
      );
    }

    const entity = filteredEntities.find((e) => e.name === selectedEntity);
    const navigationProperties = entity
      ? Array.from(
          new Set(entity.properties.navigationProperties.map((p) => p.Name)),
        ).map((Name) =>
          entity.properties.navigationProperties.find((p) => p.Name === Name),
        )
      : [];

    newValue.forEach((property) => {
      const propertyName = property.Name;
      const matchingProperty = navigationProperties.find((np) => {
        if (np.Name.endsWith('Nav')) {
          return np.Name.slice(0, -3) === propertyName;
        }
        return np.Name === propertyName;
      });

      if (matchingProperty) {
        let matchingPropertyName = matchingProperty.Name;
        if (matchingProperty.Name.endsWith('Nav')) {
          matchingPropertyName = matchingProperty.Name.slice(0, -3);
        }

        const matchingEntities = allEntities.filter(
          (entity) =>
            (entity.properties.properties.some(
              (prop) =>
                prop.Name.toLowerCase() === matchingPropertyName.toLowerCase(),
            ) ||
              entity.properties.navigationProperties.some(
                (navProp) =>
                  navProp.Name.toLowerCase() ===
                  matchingPropertyName.toLowerCase(),
              )) &&
            entity.name !== selectedEntity,
        );
        console.log('matchingEntities', matchingEntities);
        setMatchingEntitiesState(matchingEntities);
      }
    });

    console.log(config);
  };

  const handleRemove = () => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
    dispatch(removeEntityConfig(id));
    dispatch(removeFormData({ id }));
    console.log(config);
  };

  return (
    <div ref={ref}>
      <Card
        color={isTargetOfEdge ? 'primary' : 'neutral'}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: '40em',
          padding: 3,
        }}
      >
        <Autocomplete
          options={sortedEntities}
          groupBy={(option) =>
            (option['sap:label'] || option.name || '').charAt(0).toUpperCase()
          }
          getOptionLabel={(option) => option['sap:label'] || option.name}
          placeholder='Select an entity'
          onChange={(event, newValue) => handleEntityChange(event, newValue)}
          isOptionEqualToValue={(option, value) => option.name === value.name}
          sx={{ width: '14rem' }}
        />
        <div className='flex items-center'>
          <Button
            color='neutral'
            variant='outlined'
            onClick={() => setFilterModalOpen(true)}
            disabled={!selectedEntity}
          >
            {!formData[id] ? 'Add Filter' : 'Edit Filter'}
          </Button>
        </div>

        <div className='flex items-center flex-col gap-2 max-w-[225px]'>
          <Tooltip
            title='Select all properties you want to display'
            placement='top'
            variant='solid'
          >
            <span>
              <Autocomplete
                options={uniqueSortedPropertyOptions}
                groupBy={(option) => option.Name.charAt(0).toUpperCase()}
                getOptionLabel={(option) => option.Name}
                placeholder='Select a property'
                onChange={(event, newValue) =>
                  handleSelectedPropertyChange(
                    'mainAutocomplete',
                    event,
                    newValue,
                  )
                }
                key={resetKey}
                multiple={true}
                isOptionEqualToValue={(option, value) =>
                  option.Name === value?.Name
                }
                sx={{
                  width: '14rem',
                }}
              />
            </span>
          </Tooltip>
          {matchingEntitiesState.length > 0 && (
            <AccordionGroup
              sx={(theme) => ({
                maxWidth: '100%',
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
                <Accordion key={entity.name}>
                  <AccordionSummary>{entity.name}</AccordionSummary>
                  <AccordionDetails>
                    <Autocomplete
                      options={[
                        ...entity.properties.properties,
                        ...entity.properties.navigationProperties,
                      ].sort((a, b) => a.Name.localeCompare(b.Name))}
                      groupBy={(option) => option.Name.charAt(0).toUpperCase()}
                      getOptionLabel={(option) => option.Name}
                      placeholder='Select a property'
                      multiple
                      onChange={(event, newValue) =>
                        handleSelectedPropertyChange(
                          entity.name,
                          event,
                          newValue,
                        )
                      }
                      sx={{ marginTop: 1 }}
                    />
                  </AccordionDetails>
                </Accordion>
              ))}
            </AccordionGroup>
          )}
        </div>

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
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        entity={selectedEntity}
        id={id}
      />
    </div>
  );
}

EntitySection.propTypes = {
  id: PropTypes.number.isRequired,
};
