import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import Dropdown from './Dropdown';
import {
  addEntity,
  deleteEntity,
  addPropertySelection,
  deletePropertySelection,
  setPropertyOptions,
  deleteRawFormDataForId,
  deleteID,
} from '../redux/entitiesSlice';
import PropTypes from 'prop-types';
import { Button, Card, IconButton, Tooltip } from '@mui/joy';
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
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const centerDropdownRef = useRef(null);
  const rightDropdownRef = useRef(null);

  const { setNodes } = useReactFlow();

  const handleEntityChange = (entityName) => {
    if (selectedEntity) {
      dispatch(deleteEntity({ id, entityName: selectedEntity }));
      setSelectedProperties([]);
    }

    dispatch(addEntity({ id, entityName }));
    setSelectedEntity(entityName);

    const entity = filteredEntities.find((e) => e.name === entityName);
    const properties = entity
      ? Array.from(new Set(entity.properties.map((p) => p.Name))).map((name) =>
          entity.properties.find((p) => p.Name === name),
        )
      : [];

    dispatch(setPropertyOptions({ id, properties }));
    dispatch(deleteRawFormDataForId({ id }));

    centerDropdownRef.current?.resetDropdown();
    rightDropdownRef.current?.resetDropdown();
  };

  const handleSelectedPropertyChange = (propertyName) => {
    if (selectedProperties.includes(propertyName)) {
      setSelectedProperties(
        selectedProperties.filter((p) => p !== propertyName),
      );
      dispatch(
        deletePropertySelection({
          entityName: selectedEntity,
          propertyName,
          id,
        }),
      );
    } else {
      setSelectedProperties([...selectedProperties, propertyName]);
      dispatch(
        addPropertySelection({ entityName: selectedEntity, propertyName, id }),
      );
    }
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
        }}
      >
        <Dropdown
          id='dropdown-left'
          options={filteredEntities.map((e) => ({
            value: e.name,
            label: e['sap:label'] || e.name,
          }))}
          defaultValue='Select an entity'
          onChange={handleEntityChange}
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
            <Dropdown
              id='dropdown-right'
              options={propertyOptions.map((p) => ({
                value: p.Name,
                label: p['sap:label'] || p.Name,
              }))}
              defaultValue={'Select a property'}
              onChange={handleSelectedPropertyChange}
              ref={rightDropdownRef}
              multiple={true}
            />
          </span>
        </Tooltip>
        <Handle type='source' position={Position.Right} className='!w-3 !h-3' />
        <Handle
          type='target'
          position={Position.Top}
          className='!w-3 !h-3 border !border-black !bg-white'
        />
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
