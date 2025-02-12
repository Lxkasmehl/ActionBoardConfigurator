import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from './Dropdown';
import {
  addEntity,
  deleteEntity,
  deletePropertyFilter,
  addFilter,
  addPropertySelection,
  deletePropertySelection,
} from '../redux/entitiesSlice';
import PropTypes from 'prop-types';
import { Card, Input, Tooltip } from '@mui/joy';

const operatorOptions = [
  { value: '=', label: '=' },
  { value: '!=', label: '≠' },
  { value: '<', label: '<' },
  { value: '<=', label: '≤' },
  { value: '>', label: '>' },
  { value: '>=', label: '≥' },
  { value: 'LIKE', label: 'LIKE' },
  { value: 'NOT LIKE', label: 'NOT LIKE' },
  { value: 'IN', label: 'IN' },
  { value: 'NOT IN', label: 'NOT IN' },
  { value: 'BETWEEN', label: 'BETWEEN' },
  { value: 'IS NULL', label: 'IS NULL' },
  { value: 'IS NOT NULL', label: 'IS NOT NULL' },
];

export default function EntitySection({ id }) {
  const dispatch = useDispatch();
  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
  const config = useSelector((state) => state.entities.config);

  const [selectedEntity, setSelectedEntity] = useState(null);
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState(null);
  const [filterValue, setFilterValue] = useState('');
  const [selectedProperties, setSelectedProperties] = useState([]);

  const centerDropdownRef = useRef(null);
  const rightDropdownRef = useRef(null);
  const operatorDropdownRef = useRef(null);

  const handleEntityChange = (entityName) => {
    if (selectedEntity) {
      dispatch(deleteEntity({ id, entityName: selectedEntity }));
      setSelectedPropertyFilter(null);
      setSelectedProperties([]);
      setFilterValue('');
    }

    dispatch(addEntity({ id, entityName }));
    setSelectedEntity(entityName);

    const entity = filteredEntities.find((e) => e.name === entityName);
    setPropertyOptions(
      entity
        ? Array.from(new Set(entity.properties.map((p) => p.Name))).map(
            (name) => entity.properties.find((p) => p.Name === name),
          )
        : [],
    );

    centerDropdownRef.current?.resetDropdown();
    rightDropdownRef.current?.resetDropdown();
    operatorDropdownRef.current?.resetDropdown();
    setFilterValue('');
  };

  const handlePropertyFilterChange = (propertyName) => {
    if (selectedPropertyFilter) {
      dispatch(
        deletePropertyFilter({
          entityName: selectedEntity,
          propertyName: selectedPropertyFilter,
          id,
        }),
      );
    }
    setSelectedPropertyFilter(propertyName);
    setFilterValue('');

    console.log(config);
  };

  const handleFilterValueChange = (e) => {
    setFilterValue(e.target.value);
    dispatch(
      addFilter({
        entityName: selectedEntity,
        propertyName: selectedPropertyFilter,
        filterValue: e.target.value,
        id,
      }),
    );

    console.log(config);
  };

  const handleSelectedPropertyChange = (propertyName) => {
    console.log(selectedProperties);
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

  const handleOperatorChange = () => {};

  return (
    // className='flex items-center justify-around px-6 py-8 bg-gray-800 lg:w-[50em] w-[90%] text-white rounded-lg shadow-lg'
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '60em',
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
        <Dropdown
          id='dropdown-center'
          options={propertyOptions
            .filter((p) => p['sap:filterable'] === 'true')
            .map((p) => ({
              value: p.Name,
              label: p['sap:label'] || p.Name,
            }))}
          defaultValue='Select a filter'
          onChange={handlePropertyFilterChange}
          ref={centerDropdownRef}
          sx={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            width: 150,
          }}
        />
        <Dropdown
          options={operatorOptions}
          defaultValue='Operator'
          onChange={handleOperatorChange}
          ref={operatorDropdownRef}
          disabled={!selectedPropertyFilter}
          sx={{
            borderRadius: 0,
            width: 120,
          }}
        />
        <Input
          variant='outlined'
          type='text'
          placeholder='Enter filter value'
          value={filterValue}
          onChange={handleFilterValueChange}
          disabled={!selectedPropertyFilter}
          sx={{
            p: 0,
            pl: 1,
            width: 150,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        />
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
    </Card>
  );
}

EntitySection.propTypes = { id: PropTypes.number.isRequired };
