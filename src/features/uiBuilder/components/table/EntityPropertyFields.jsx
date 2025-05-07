import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FormControl, FormLabel, Autocomplete } from '@mui/joy';
import {
  getNavigationProperties,
  findMatchingEntity,
} from '../../../dataPicker/utils/entity/entityNavigation';

const NavigationPropertySelector = ({
  entity,
  property,
  onPropertyChange,
  associationSets,
  allEntities,
  navigationPath = [],
  onPathChange,
}) => {
  const [matchingEntity, setMatchingEntity] = useState(null);
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    if (property?.isNavigation && associationSets && allEntities) {
      const { matchingEntity: matchedEntity } =
        findMatchingEntity({
          propertyName: property.name,
          navigationProperties: getNavigationProperties(entity),
          associationSets,
          allEntities,
        }) || {};

      if (matchedEntity) {
        setMatchingEntity(matchedEntity);
        const props = [];

        // Add regular properties
        if (Array.isArray(matchedEntity.properties.properties)) {
          // eslint-disable-next-line react/prop-types
          props.push(
            ...matchedEntity.properties.properties.map((p) => ({
              name: p.Name || p.name,
              type: p.Type || p.type,
              isNavigation: false,
            })),
          );
        }

        // Add navigation properties
        if (Array.isArray(matchedEntity.properties.navigationProperties)) {
          // eslint-disable-next-line react/prop-types
          props.push(
            ...matchedEntity.properties.navigationProperties.map((p) => ({
              name: p.Name || p.name,
              type: p.Type || p.type,
              isNavigation: true,
              ...p,
            })),
          );
        }

        setPropertyOptions(props);
      }
    } else {
      setMatchingEntity(null);
      setPropertyOptions([]);
      setSelectedProperty(null);
    }
  }, [property, entity, associationSets, allEntities]);

  const handlePropertyChange = (_, value) => {
    setSelectedProperty(value);
    if (value?.isNavigation) {
      // Add the newly selected property to the path
      const newPath = [...navigationPath, value];
      onPathChange(newPath);
    } else {
      onPropertyChange(value, navigationPath);
    }
  };

  if (!matchingEntity) return null;

  return (
    <>
      <FormControl sx={{ maxWidth: '500px', width: '100%', marginTop: 1 }}>
        <FormLabel>
          {navigationPath.length > 0
            ? `${navigationPath[navigationPath.length - 1].name} Property`
            : `${matchingEntity.name} Property`}
        </FormLabel>
        <Autocomplete
          value={selectedProperty}
          onChange={handlePropertyChange}
          options={propertyOptions}
          getOptionLabel={(option) => option?.name || ''}
          isOptionEqualToValue={(option, value) => {
            if (!option || !value) return false;
            return option.name === value.name;
          }}
          placeholder={`Select ${
            navigationPath.length > 0
              ? navigationPath[navigationPath.length - 1].name
              : matchingEntity.name
          } Property`}
        />
      </FormControl>
      {selectedProperty?.isNavigation && (
        <NavigationPropertySelector
          entity={matchingEntity}
          property={selectedProperty}
          onPropertyChange={onPropertyChange}
          associationSets={associationSets}
          allEntities={allEntities}
          navigationPath={navigationPath}
          onPathChange={onPathChange}
        />
      )}
    </>
  );
};

NavigationPropertySelector.propTypes = {
  entity: PropTypes.object.isRequired,
  property: PropTypes.object.isRequired,
  onPropertyChange: PropTypes.func.isRequired,
  associationSets: PropTypes.array.isRequired,
  allEntities: PropTypes.array.isRequired,
  navigationPath: PropTypes.array,
  onPathChange: PropTypes.func.isRequired,
};

export default function EntityPropertyFields({
  editedItem,
  setEditedItem,
  sortedEntities,
  loading,
}) {
  const allEntities = useSelector((state) => state.fetchedData.allEntities);
  const associationSets = useSelector(
    (state) => state.fetchedData.associationSets,
  );

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
      setPropertyOptions(properties);
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
        />
      </FormControl>
      {selectedProperty?.isNavigation && (
        <NavigationPropertySelector
          entity={selectedEntity}
          property={selectedProperty}
          onPropertyChange={handleNestedPropertyChange}
          associationSets={associationSets}
          allEntities={allEntities}
          navigationPath={nestedNavigationPath}
          onPathChange={setNestedNavigationPath}
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
  }).isRequired,
  setEditedItem: PropTypes.func.isRequired,
  sortedEntities: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};
