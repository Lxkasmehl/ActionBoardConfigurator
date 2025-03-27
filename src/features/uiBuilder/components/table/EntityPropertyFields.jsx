import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { FormControl, FormLabel, Autocomplete } from '@mui/joy';

export default function EntityPropertyFields({
  editedItem,
  setEditedItem,
  sortedEntities,
  loading,
}) {
  const [selectedEntity, setSelectedEntity] = useState(editedItem.entity);
  const [selectedProperty, setSelectedProperty] = useState(editedItem.property);
  const [propertyOptions, setPropertyOptions] = useState([]);

  useEffect(() => {
    if (selectedEntity?.properties) {
      const properties = [];
      if (Array.isArray(selectedEntity.properties.properties)) {
        properties.push(
          ...selectedEntity.properties.properties.map((p) => ({
            name: p.Name || p.name,
            type: p.Type || p.type,
          })),
        );
      }
      if (Array.isArray(selectedEntity.properties.navigationProperties)) {
        properties.push(
          ...selectedEntity.properties.navigationProperties.map((p) => ({
            name: p.Name || p.name,
            type: p.Type || p.type,
          })),
        );
      }
      setPropertyOptions(properties);
    } else {
      setPropertyOptions([]);
    }
  }, [selectedEntity?.properties]);

  return (
    <>
      <FormControl>
        <FormLabel>Entity</FormLabel>
        <Autocomplete
          value={selectedEntity}
          onChange={(_, value) => {
            setSelectedEntity(value);
            setEditedItem({
              ...editedItem,
              entity: value,
              label: value?.name || editedItem.label,
            });
          }}
          options={sortedEntities}
          getOptionLabel={(option) => option?.name || ''}
          loading={loading}
          isOptionEqualToValue={(option, value) => option?.name === value?.name}
          placeholder='Select Entity'
        />
      </FormControl>
      <FormControl>
        <FormLabel>Property</FormLabel>
        <Autocomplete
          value={selectedProperty}
          onChange={(_, value) => {
            setSelectedProperty(value);
            setEditedItem({
              ...editedItem,
              property: value,
              label:
                editedItem.entity?.name && value?.name
                  ? `${editedItem.entity.name} -> ${value.name}`
                  : editedItem.label,
            });
          }}
          options={propertyOptions}
          getOptionLabel={(option) => option?.name || ''}
          loading={loading}
          disabled={!selectedEntity}
          isOptionEqualToValue={(option, value) => {
            if (!option || !value) return false;
            return option.name === value.name;
          }}
          placeholder='Select Property'
        />
      </FormControl>
    </>
  );
}

EntityPropertyFields.propTypes = {
  editedItem: PropTypes.shape({
    entity: PropTypes.object,
    property: PropTypes.object,
    label: PropTypes.string,
  }).isRequired,
  setEditedItem: PropTypes.func.isRequired,
  sortedEntities: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};
