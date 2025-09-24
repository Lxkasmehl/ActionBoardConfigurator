import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { FormControl, FormLabel, Autocomplete } from '@mui/joy';
import {
  getNavigationProperties,
  findMatchingEntity,
} from '../../../../shared/utils/entityNavigation';
import { useSelector, useDispatch } from 'react-redux';
import { setNavigationProperty } from '../../../../redux/uiBuilderSlice';

const NavigationPropertySelector = ({
  entity,
  property,
  onPropertyChange,
  allEntities,
  navigationPath = [],
  onPathChange,
  componentId,
  columnId,
  selectorId,
}) => {
  const [matchingEntity, setMatchingEntity] = useState(null);
  const [propertyOptions, setPropertyOptions] = useState([]);
  const dispatch = useDispatch();

  const selectedProperty = useSelector(
    (state) =>
      state.uiBuilder.navigationProperties[componentId]?.[columnId]?.[
        selectorId
      ],
  );

  const associationSets = useSelector(
    (state) => state.fetchedData.associationSets,
  );

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
      dispatch(
        setNavigationProperty({
          componentId,
          columnId,
          selectorId,
          property: null,
        }),
      );
    }
  }, [
    property,
    entity,
    associationSets,
    allEntities,
    componentId,
    columnId,
    selectorId,
    dispatch,
  ]);

  const handlePropertyChange = (_, value) => {
    dispatch(
      setNavigationProperty({
        componentId,
        columnId,
        selectorId,
        property: value,
      }),
    );
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
          groupBy={(option) => option.name.charAt(0).toUpperCase()}
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
          componentId={componentId}
          columnId={columnId}
          selectorId={`${selectorId}_${selectedProperty.name}`}
        />
      )}
    </>
  );
};

NavigationPropertySelector.propTypes = {
  entity: PropTypes.object.isRequired,
  property: PropTypes.object.isRequired,
  onPropertyChange: PropTypes.func.isRequired,
  allEntities: PropTypes.array.isRequired,
  navigationPath: PropTypes.array,
  onPathChange: PropTypes.func.isRequired,
  componentId: PropTypes.string.isRequired,
  columnId: PropTypes.string.isRequired,
  selectorId: PropTypes.string.isRequired,
};

export default NavigationPropertySelector;
