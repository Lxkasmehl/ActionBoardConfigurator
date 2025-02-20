import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import {
  addEntity,
  deleteEntity,
  setPropertySelection,
  setPropertyOptions,
  deleteRawFormDataForId,
  deleteID,
} from '../redux/entitiesSlice';
import PropTypes from 'prop-types';
import { Autocomplete, Button, Card, IconButton, Tooltip } from '@mui/joy';
import FilterModal from './FilterModal';
import RemoveIcon from '@mui/icons-material/Remove';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function EntitySection({ id }) {
  const dispatch = useDispatch();

  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
  const config = useSelector((state) => state.entities.config);
  const rawFormData = useSelector((state) => state.entities.rawFormData);

  const selectPropertyOptions = createSelector(
    (state) => state.entities.propertyOptions,
    (_, id) => id,
    (propertyOptions, id) => propertyOptions[id] || [],
  );

  const propertyOptions = useSelector((state) =>
    selectPropertyOptions(state, id),
  );

  const [selectedEntity, setSelectedEntity] = useState(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const { setNodes } = useReactFlow();

  const sortedEntities = [...filteredEntities].sort((a, b) => {
    const labelA = (a['sap:label'] || a.name || '').toLowerCase();
    const labelB = (b['sap:label'] || b.name || '').toLowerCase();
    return labelA.localeCompare(labelB);
  });

  const sortedPropertyOptions = [...propertyOptions].sort((a, b) => {
    const labelA = (a['sap:label'] || a.name || '').toLowerCase();
    const labelB = (b['sap:label'] || b.name || '').toLowerCase();
    return labelA.localeCompare(labelB);
  });

  const handleEntityChange = (_, newValue) => {
    if (!newValue) return;

    const entityName = newValue.name;
    setSelectedEntity(entityName);

    if (selectedEntity) {
      dispatch(deleteEntity({ id, entityName: selectedEntity }));
    }

    dispatch(addEntity({ id, entityName }));

    const entity = filteredEntities.find((e) => e.name === entityName);
    const properties = entity
      ? Array.from(new Set(entity.properties.map((p) => p.Name))).map((name) =>
          entity.properties.find((p) => p.Name === name),
        )
      : [];

    dispatch(setPropertyOptions({ id, properties }));
    dispatch(deleteRawFormDataForId({ id }));

    setResetKey((prev) => prev + 1);
  };

  const handleSelectedPropertyChange = (_, newValue) => {
    if (!newValue) return;

    const propertyNames = newValue.map((item) => item.name);

    dispatch(
      setPropertySelection({ entityName: selectedEntity, propertyNames, id }),
    );
    console.log(propertyNames);
    console.log(config);
  };

  const handleRemove = () => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
    dispatch(deleteID(id));
    dispatch(deleteRawFormDataForId({ id }));
    console.log(config);
  };

  return (
    // className='flex items-center justify-around px-6 py-8 bg-gray-800 lg:w-[50em] w-[90%] text-white rounded-lg shadow-lg'
    <>
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
          isOptionEqualToValue={(option, value) => option.value === value.value}
          sx={{ width: '14rem' }}
        />
        <div className='flex items-center'>
          <Button
            color='neutral'
            variant='outlined'
            onClick={() => setFilterModalOpen(true)}
            disabled={!selectedEntity}
          >
            {!rawFormData[id] ? 'Add Filter' : 'Edit Filter'}
          </Button>
        </div>

        <Tooltip
          title='Select all properties you want to display'
          placement='top'
          variant='solid'
        >
          <span>
            <Autocomplete
              options={sortedPropertyOptions}
              groupBy={(option) =>
                (option['sap:label'] || option.name || '')
                  .charAt(0)
                  .toUpperCase()
              }
              getOptionLabel={(option) => option['sap:label'] || option.name}
              placeholder='Select a property'
              onChange={(event, newValue) =>
                handleSelectedPropertyChange(event, newValue)
              }
              key={resetKey}
              multiple
              isOptionEqualToValue={(option, value) =>
                option.value === value?.value
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
    </>
  );
}

EntitySection.propTypes = {
  id: PropTypes.number.isRequired,
};
