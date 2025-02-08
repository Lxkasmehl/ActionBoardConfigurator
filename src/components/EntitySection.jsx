import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from './Dropdown';
import { addEntity, deleteEntity } from '../redux/entitiesSlice';

export default function EntitySection() {
  const dispatch = useDispatch();
  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);

  const handleEntityDropdownChange = (selectedValue) => {
    if (selectedEntity) {
      dispatch(deleteEntity(selectedEntity));
    }

    dispatch(addEntity(selectedValue));
    setSelectedEntity(selectedValue);

    const entity = filteredEntities.find(
      (entity) => entity.name === selectedValue,
    );

    if (entity) {
      const uniqueProperties = [];
      const filterableProperties = entity.properties.filter(
        (property) => property['sap:filterable'] === 'true',
      );

      filterableProperties.forEach((property) => {
        if (!uniqueProperties.some((prop) => prop.Name === property.Name)) {
          uniqueProperties.push(property);
        }
      });

      setPropertyOptions(uniqueProperties);
    }
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
          options={propertyOptions.map((property) => ({
            value: property.Name,
            label: property['sap:label'] || property.Name,
          }))}
          defaultValue='Select a property'
        />
        <input
          type='text'
          placeholder='Enter filter value'
          className='bg-gray-600 text-white rounded px-2 py-1 mt-4'
        />
      </div>

      <div className='flex flex-col justify-center items-end'>
        <Dropdown
          id='dropdown-right'
          options={[
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
            { value: '3', label: 'Option 3' },
          ]}
          defaultValue='Select an option'
        />
      </div>
    </section>
  );
}
