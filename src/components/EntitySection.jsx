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
  Tooltip,
} from '@mui/joy';
import FilterModal from './FilterModal';
import RemoveIcon from '@mui/icons-material/Remove';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { selectPropertyOptions } from '../redux/selectors/entitySelectors';
import { useEntityChangeHandler } from '../hooks/useEntityChangeHandler';
import { useModalState } from '../hooks/useModalState';
import {
  sortEntities,
  sortProperties,
  filterUniqueProperties,
} from '../utils/entityUtils';
import {
  setSelectedProperties,
  setPropertySelection,
  removeEntityConfig,
  removeFormData,
} from '../redux/entitiesSlice';

export default function EntitySection({ id }) {
  const [matchingEntitiesState, setMatchingEntitiesState] = useState([]);
  const [selectedPropertiesState, setSelectedPropertiesState] = useState({});
  const [resetKey, setResetKey] = useState(0);

  const dispatch = useDispatch();
  const { isOpen, openModal, closeModal } = useModalState();

  const { setNodes, getEdges } = useReactFlow();
  const edges = getEdges();
  const isTargetOfEdge = edges.some((edge) => edge.target === id);

  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
  const allEntities = useSelector((state) => state.entities.allEntities);
  const associationSets = useSelector(
    (state) => state.entities.associationSets,
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
    setResetKey,
    setMatchingEntitiesState,
  );

  const handleSelectedPropertyChange = (autocompleteId, _, newValue) => {
    const newSelectedProperties = {
      ...selectedPropertiesState,
      [autocompleteId]: newValue.map((item) => item.Name),
    };
    setSelectedPropertiesState(newSelectedProperties);

    console.log(newSelectedProperties);

    const allSelectedPropertyNames = Object.entries(
      newSelectedProperties,
    ).flatMap(([key, values]) => {
      if (key === 'mainAutocomplete') {
        return values;
      }
      return values.map((value) => `${key}/${value}`);
    });

    console.log('allSelectedPropertyNames', allSelectedPropertyNames);

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

    //TODO: Was passiert wenn manager, manager/manager und manager/manager/manager existieren und manager entfernt wird?

    const entity = filteredEntities.find((e) => e.name === selectedEntity);
    const navigationProperties = entity
      ? Array.from(
          new Set(entity.properties.navigationProperties.map((p) => p.Name)),
        ).map((Name) =>
          entity.properties.navigationProperties.find((p) => p.Name === Name),
        )
      : [];

    let matchingEntities = [];

    allSelectedPropertyNames.forEach((propertyPath) => {
      const propertyName = propertyPath.includes('/')
        ? propertyPath.split('/').slice(-1)[0]
        : propertyPath;

      const matchingProperty = navigationProperties.find((np) => {
        if (np.Name.endsWith('Nav')) {
          return np.Name.slice(0, -3) === propertyName;
        }
        return np.Name === propertyName;
      });

      if (matchingProperty) {
        const matchingAssociationSet = associationSets.find((as) => {
          const relationship = matchingProperty.Relationship.startsWith(
            'SFOData.',
          )
            ? matchingProperty.Relationship.slice(8)
            : matchingProperty.Relationship;
          return as.name === relationship;
        });

        if (matchingAssociationSet) {
          const matchingEndElement = matchingAssociationSet.endElements.find(
            (ee) => {
              return ee.Role === matchingProperty.ToRole;
            },
          );

          if (matchingEndElement) {
            const matchingEntity = allEntities.find((e) => {
              return e.name === matchingEndElement.EntitySet;
            });

            if (matchingEntity) {
              matchingEntities.push({ propertyPath, matchingEntity });
            }
          }
        }
      }
    });

    setMatchingEntitiesState(matchingEntities);
    console.log(config);
  };

  const handleRemove = () => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
    dispatch(removeEntityConfig(id));
    dispatch(removeFormData({ id }));
    console.log(config);
  };

  return (
    <div>
      <Card
        color={isTargetOfEdge ? 'primary' : 'neutral'}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          minWidth: '40em',
          width: 'fit-content',
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
          onChange={handleEntityChange}
          isOptionEqualToValue={(option, value) => option.name === value.name}
          sx={{ width: '14rem' }}
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
                multiple={true}
                disableCloseOnSelect
                isOptionEqualToValue={(option, value) =>
                  option.Name === value?.Name
                }
                key={resetKey}
                sx={{
                  width: '14rem',
                }}
              />
            </span>
          </Tooltip>
          {matchingEntitiesState.length > 0 && (
            <AccordionGroup
              sx={(theme) => ({
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
                <Accordion key={entity.propertyPath}>
                  <AccordionSummary>{entity.propertyPath}</AccordionSummary>
                  <AccordionDetails>
                    <Autocomplete
                      options={[
                        ...entity.matchingEntity.properties.properties,
                        ...entity.matchingEntity.properties
                          .navigationProperties,
                      ].sort((a, b) => a.Name.localeCompare(b.Name))}
                      groupBy={(option) => option.Name.charAt(0).toUpperCase()}
                      getOptionLabel={(option) => option.Name}
                      placeholder='Select a property'
                      multiple
                      disableCloseOnSelect
                      onChange={(event, newValue) =>
                        handleSelectedPropertyChange(
                          entity.propertyPath,
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
