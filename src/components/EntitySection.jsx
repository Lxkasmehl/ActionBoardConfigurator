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

export default function EntitySection() {
  const dispatch = useDispatch();
  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
  const config = useSelector((state) => state.entities.config);
  const [state, setState] = useState({
    propertyOptions: [],
    selectedEntity: null,
    selectedPropertyFilter: null,
    selectedProperty: null,
  });
  const inputRef = useRef(null);

  const handleEntityDropdownChange = (selectedValue) => {
    if (state.selectedEntity) {
      dispatch(deleteEntity(state.selectedEntity));
    }

    dispatch(addEntity(selectedValue));
    setState((prev) => ({ ...prev, selectedEntity: selectedValue }));

    const entity = filteredEntities.find(
      (entity) => entity.name === selectedValue,
    );

    if (entity) {
      const uniqueProperties = Array.from(
        new Set(entity.properties.map((prop) => prop.Name)),
      ).map((name) => entity.properties.find((prop) => prop.Name === name));

      setState((prev) => ({ ...prev, propertyOptions: uniqueProperties }));
    }

    console.log(config);
  };

  const handlePropertyDropdownChange = (selectedValue) => {
    if (state.selectedPropertyFilter) {
      dispatch(
        deletePropertyFilter({
          entityName: state.selectedEntity,
          propertyName: state.selectedPropertyFilter,
        }),
      );
    }

    setState((prev) => ({ ...prev, selectedPropertyFilter: selectedValue }));
    inputRef.current.value = '';
  };

  const handleFilterValueChange = (event) => {
    dispatch(
      addFilter({
        entityName: state.selectedEntity,
        propertyName: state.selectedPropertyFilter,
        filterValue: event.target.value,
      }),
    );

    console.log(config);
  };

  const handleSelectedPropertyChange = (selectedValue) => {
    if (state.selectedProperty) {
      dispatch(
        deletePropertySelection({
          entityName: state.selectedEntity,
          propertyName: state.selectedProperty,
        }),
      );
    }

    setState((prev) => ({ ...prev, selectedProperty: selectedValue }));

    dispatch(
      addPropertySelection({
        entityName: state.selectedEntity,
        propertyName: selectedValue,
      }),
    );

    console.log(config);
  };

  return (
    <section className='flex items-center justify-around px-6 py-8 bg-gray-800 lg:w-[50em] lg:min-h-[4em] w-[90%] min-h-[4.5em] text-white rounded-lg shadow-lg'>
      <div className='flex flex-col justify-center items-center'>
        <Dropdown
          id='dropdown-left'
          options={filteredEntities.map((entity) => ({
            value: entity.name,
            label: entity['sap:label'] || entity.name,
          }))}
          defaultValue='Select an entity'
          onChange={handleEntityDropdownChange}
        />
      </div>

      <div className='flex flex-col justify-center items-center'>
        <Dropdown
          id='dropdown-center'
          options={state.propertyOptions
            .filter((property) => property['sap:filterable'] === 'true')
            .map((property) => ({
              value: property.Name,
              label: property['sap:label'] || property.Name,
            }))}
          defaultValue='Select a filter'
          onChange={handlePropertyDropdownChange}
        />
        <input
          type='text'
          placeholder='Enter filter value'
          className='bg-gray-600 text-white rounded px-2 py-1 mt-4'
          onChange={handleFilterValueChange}
          disabled={!state.selectedPropertyFilter}
          ref={inputRef}
        />
      </div>

      <div className='flex flex-col justify-center items-end'>
        <Dropdown
          id='dropdown-right'
          options={state.propertyOptions.map((property) => ({
            value: property.Name,
            label: property['sap:label'] || property.Name,
          }))}
          defaultValue='Select a property'
          onChange={handleSelectedPropertyChange}
        />
      </div>
    </section>
  );
}
