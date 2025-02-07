import { useState } from 'react';
import { useSelector } from 'react-redux';

export default function PropertiesFilter() {
  const [filters, setFilters] = useState({});
  const selectedEntities = useSelector(
    (state) => state.entities.selectedEntities,
  );

  const handleFilterChange = (propertyName, value) => {
    setFilters((prev) => ({ ...prev, [propertyName]: value }));
  };

  return (
    <div className='w-3/4 p-4 bg-gray-100 rounded-lg shadow-medium mt-8'>
      <h3 className='text-xl font-semibold mb-4'>Filter Properties</h3>
      <div className='grid grid-cols-2 gap-4'>
        {[
          ...new Map(
            selectedEntities[0].properties
              .filter((property) => property['sap:filterable'] === 'true')
              .map((property) => [property['sap:label'], property]),
          ).values(),
        ].map((property) => (
          <div key={property['sap:label']} className='flex flex-col'>
            <label className='font-medium text-gray-700'>
              {property['sap:label']}
            </label>
            <input
              type='text'
              value={filters[property.Name] || ''}
              onChange={(e) => {
                handleFilterChange(property.Name, e.target.value);
              }}
              className='p-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300'
              placeholder='Enter filter value'
            />
          </div>
        ))}
      </div>
    </div>
  );
}
