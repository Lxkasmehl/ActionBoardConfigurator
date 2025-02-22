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
import { Autocomplete, Button, Card, IconButton, Tooltip } from '@mui/joy';
import FilterModal from './FilterModal';
import RemoveIcon from '@mui/icons-material/Remove';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function EntitySection({ id }) {
  const dispatch = useDispatch();

  const entities = useSelector((state) => state.entities.entities);
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

  const { setNodes, getEdges } = useReactFlow();

  const ref = useRef();

  const sortedEntities = [...entities].sort((a, b) => {
    const labelA = (a['sap:label'] || a.Name || '').toLowerCase();
    const labelB = (b['sap:label'] || b.Name || '').toLowerCase();
    return labelA.localeCompare(labelB);
  });

  const sortedPropertyOptions = [...propertyOptions].sort((a, b) => {
    const labelA = (a['sap:label'] || a.Name || '').toLowerCase();
    const labelB = (b['sap:label'] || b.Name || '').toLowerCase();
    return labelA.localeCompare(labelB);
  });

  const uniqueSortedPropertyOptions = sortedPropertyOptions.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t['sap:label'] === value['sap:label']),
  );

  const handleEntityChange = (_, newValue) => {
    if (!newValue) return;

    const entityName = newValue.name;

    const entity = entities.find((e) => e.name === entityName);
    const properties = entity
      ? Array.from(new Set(entity.properties.map((p) => p.Name))).map((Name) =>
          entity.properties.find((p) => p.Name === Name),
        )
      : [];

    const edges = getEdges();
    const isTargetOfEdge = edges.some((edge) => edge.target === id);

    if (isTargetOfEdge) {
      if (selectedEntity) {
        dispatch(removeEntity({ id, entityName: selectedEntity }));
      }
      dispatch(addEntity({ id, entityName }));
      dispatch(removeFormData({ id }));
    }

    dispatch(setPropertyOptions({ id, properties }));
    dispatch(setSelectedEntity({ id, entityName }));

    setResetKey((prev) => prev + 1);

    console.log(config);
  };

  const handleSelectedPropertyChange = (_, newValue) => {
    const edges = getEdges();
    const isTargetOfEdge = edges.some((edge) => edge.target === id);

    const propertyNames = newValue.map((item) => item.Name);

    if (!newValue || !isTargetOfEdge) {
      dispatch(setSelectedProperties({ id, propertyNames }));
    } else {
      dispatch(
        setPropertySelection({ entityName: selectedEntity, propertyNames, id }),
      );
    }

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

        <Tooltip
          title='Select all properties you want to display'
          placement='top'
          variant='solid'
        >
          <span>
            <Autocomplete
              options={uniqueSortedPropertyOptions}
              groupBy={(option) => option['sap:label'].charAt(0).toUpperCase()}
              getOptionLabel={(option) => option['sap:label'] || option.Name}
              placeholder='Select a property'
              onChange={(event, newValue) =>
                handleSelectedPropertyChange(event, newValue)
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
