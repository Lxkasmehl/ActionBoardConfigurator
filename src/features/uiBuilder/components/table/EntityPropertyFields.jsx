import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FormControl, FormLabel, Autocomplete } from '@mui/joy';
import NavigationPropertySelector from './NavigationPropertySelector';

export default function EntityPropertyFields({
  editedItem,
  setEditedItem,
  sortedEntities,
  loading,
}) {
  const allEntities = useSelector((state) => state.fetchedData.allEntities);

  const [selectedEntity, setSelectedEntity] = useState(
    editedItem.entity || null,
  );
  const [selectedProperty, setSelectedProperty] = useState(
    editedItem.property || null,
  );
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [nestedNavigationPath, setNestedNavigationPath] = useState(
    editedItem.nestedNavigationPath || [],
  );

  useEffect(() => {
    if (selectedEntity?.properties) {
      const properties = [];
      if (Array.isArray(selectedEntity.properties.properties)) {
        properties.push(
          ...selectedEntity.properties.properties.map((p) => ({
            name: p.Name || p.name,
            type: p.Type || p.type,
            isNavigation: false,
          })),
        );
      }
      if (Array.isArray(selectedEntity.properties.navigationProperties)) {
        properties.push(
          ...selectedEntity.properties.navigationProperties.map((p) => ({
            name: p.Name || p.name,
            type: p.Type || p.type,
            isNavigation: true,
            ...p,
          })),
        );
      }
      // Sort properties alphabetically by name
      const sortedProperties = properties.sort((a, b) =>
        a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }),
      );
      setPropertyOptions(sortedProperties);
    } else {
      setPropertyOptions([]);
    }
  }, [selectedEntity?.properties]);

  const handlePropertyChange = (_, value) => {
    setSelectedProperty(value);
    if (value?.isNavigation) {
      setNestedNavigationPath([value]);
      setEditedItem({
        ...editedItem,
        property: value,
        nestedProperty: null,
        nestedNavigationPath: [value],
      });
    } else {
      setNestedNavigationPath([]);
      setEditedItem({
        ...editedItem,
        property: value,
        nestedProperty: null,
        nestedNavigationPath: [],
      });
    }
  };

  const handleNestedPropertyChange = (property, path) => {
    setEditedItem({
      ...editedItem,
      nestedProperty: property,
      nestedNavigationPath: path,
    });
  };

  return (
    <>
      <FormControl sx={{ maxWidth: '500px', width: '100%' }}>
        <FormLabel>Entity</FormLabel>
        <Autocomplete
          value={selectedEntity}
          onChange={(_, value) => {
            setSelectedEntity(value);
            setEditedItem({
              ...editedItem,
              entity: value,
            });
          }}
          options={sortedEntities}
          getOptionLabel={(option) => option?.name || ''}
          loading={loading}
          isOptionEqualToValue={(option, value) => option?.name === value?.name}
          placeholder='Select Entity'
          groupBy={(option) => option.name.charAt(0).toUpperCase()}
        />
      </FormControl>
      <FormControl sx={{ maxWidth: '500px', width: '100%', marginTop: 1 }}>
        <FormLabel>Property</FormLabel>
        <Autocomplete
          value={selectedProperty}
          onChange={handlePropertyChange}
          options={propertyOptions}
          getOptionLabel={(option) => option?.name || ''}
          loading={loading}
          disabled={!selectedEntity}
          isOptionEqualToValue={(option, value) => {
            if (!option || !value) return false;
            return option.name === value.name;
          }}
          placeholder='Select Property'
          groupBy={(option) => option.name.charAt(0).toUpperCase()}
        />
      </FormControl>
      {selectedProperty?.isNavigation && (
        <NavigationPropertySelector
          entity={selectedEntity}
          property={selectedProperty}
          onPropertyChange={handleNestedPropertyChange}
          allEntities={allEntities}
          navigationPath={nestedNavigationPath}
          onPathChange={setNestedNavigationPath}
          componentId={editedItem.componentId}
          columnId={editedItem.columnId}
          selectorId={`${editedItem.componentId}_${editedItem.columnId}_${selectedProperty.name}`}
        />
      )}
    </>
  );
}

EntityPropertyFields.propTypes = {
  editedItem: PropTypes.shape({
    entity: PropTypes.object,
    property: PropTypes.object,
    nestedProperty: PropTypes.object,
    nestedNavigationPath: PropTypes.array,
    label: PropTypes.string,
    componentId: PropTypes.string.isRequired,
    columnId: PropTypes.string.isRequired,
  }).isRequired,
  setEditedItem: PropTypes.func.isRequired,
  sortedEntities: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};
