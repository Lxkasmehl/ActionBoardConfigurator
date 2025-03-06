import { useState } from 'react';
import { Autocomplete, Select, Option, Card, Typography } from '@mui/joy';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  OPERATOR_OPTIONS,
  AUTOCOMPLETE_STYLES,
  SELECT_STYLES,
} from './dropdownsAndInput.constants';
import PropertyTypeInput from './PropertyTypeInput';
import usePropertyOptions from '../hooks/usePropertyOptions';

export default function DropdownsAndInput({
  propertyOptionsId,
  fieldIdentifierId,
  ...props
}) {
  const formData = useSelector((state) => state.entities.formData);
  const storedMatchingEntityObjects = useSelector(
    (state) => state.entities.matchingEntityObjects,
  );

  const allEntities = useSelector((state) => state.entities.allEntities);
  const associationSets = useSelector(
    (state) => state.entities.associationSets,
  );
  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
  const selectedEntities = useSelector(
    (state) => state.entities.selectedEntities,
  );
  const selectedEntity = selectedEntities[propertyOptionsId];

  const { combinedOptions, propertyOptions } =
    usePropertyOptions(propertyOptionsId);

  const [property, setProperty] = useState(() => {
    const storedPropertyName =
      formData[propertyOptionsId]?.[`property_${fieldIdentifierId}`];

    return storedPropertyName
      ? propertyOptions.find((prop) => prop.Name === storedPropertyName) || null
      : null;
  });

  const [operator, setOperator] = useState(
    formData[propertyOptionsId]?.[`operator_${fieldIdentifierId}`] ?? '',
  );

  const [value, setValue] = useState(
    formData[propertyOptionsId]?.[`value_${fieldIdentifierId}`] ?? '',
  );

  const [matchingEntityObjectState, setMatchingEntityObjectState] = useState(
    () => {
      const storedState =
        storedMatchingEntityObjects[propertyOptionsId]?.[fieldIdentifierId];
      if (storedState) {
        return storedState;
      }
      return null;
    },
  );

  const [path, setPath] = useState(
    formData[propertyOptionsId]?.[`fullPath_${fieldIdentifierId}`] ?? '',
  );

  const [autocompleteKey, setAutocompleteKey] = useState(0);

  const [partialPath, setPartialPath] = useState(() => {
    const initialPath =
      formData[propertyOptionsId]?.[`fullPath_${fieldIdentifierId}`] ?? '';
    const lastSlashIndex = initialPath.lastIndexOf('/');
    return lastSlashIndex >= 0 ? initialPath.substring(0, lastSlashIndex) : '';
  });

  const handleValueChange = (e) => {
    setValue(typeof e === 'object' && e.target ? e.target.value : e);
  };

  const handlePropertyChange = (e, newValue) => {
    if (!newValue) return;

    const newValueName = newValue.Name;

    const currentEntity =
      matchingEntityObjectState?.matchingEntity ||
      filteredEntities.find((e) => e.name === selectedEntity);

    const navigationProperties = currentEntity
      ? Array.from(
          new Set(
            currentEntity.properties.navigationProperties.map((p) => p.Name),
          ),
        ).map((Name) =>
          currentEntity.properties.navigationProperties.find(
            (p) => p.Name === Name,
          ),
        )
      : [];

    const isNavigationProperty = navigationProperties.some((np) =>
      np.Name.endsWith('Nav')
        ? np.Name.slice(0, -3) === newValueName
        : np.Name === newValueName,
    );

    if (!isNavigationProperty) {
      setProperty(newValue);
      const pathParts = path.split('/');

      let relevantNavigationProperties = navigationProperties;
      if (pathParts.length > 0) {
        const currentEntity = filteredEntities.find(
          (e) => e.name === selectedEntity,
        );
        const navProp = currentEntity.properties.navigationProperties.find(
          (np) =>
            np.Name.endsWith('Nav')
              ? np.Name.slice(0, -3) === pathParts[pathParts.length - 1]
              : np.Name === pathParts[pathParts.length - 1],
        );
        if (navProp) {
          const relationship = navProp.Relationship.startsWith('SFOData.')
            ? navProp.Relationship.slice(8)
            : navProp.Relationship;
          const matchingAssociationSet = associationSets.find(
            (as) => as.name === relationship,
          );
          const matchingEndElement = matchingAssociationSet?.endElements.find(
            (ee) => ee.Role === navProp.FromRole,
          );
          const newCurrentEntity = allEntities.find(
            (e) => e.name === matchingEndElement?.EntitySet,
          );
          if (newCurrentEntity) {
            relevantNavigationProperties =
              newCurrentEntity.properties.navigationProperties;
          }
        }
      }

      const lastPartIsNavigation = relevantNavigationProperties.some((np) =>
        np.Name.endsWith('Nav')
          ? np.Name.slice(0, -3) === pathParts[pathParts.length - 1]
          : np.Name === pathParts[pathParts.length - 1],
      );

      const newPath = matchingEntityObjectState
        ? pathParts.length > 0
          ? lastPartIsNavigation
            ? `${path}/${newValueName}`
            : [...pathParts.slice(0, -1), newValueName].join('/')
          : newValueName
        : newValueName;

      setPath(newPath);
      setMatchingEntityObjectState({
        ...matchingEntityObjectState,
        path: newPath,
      });
      setAutocompleteKey((prev) => prev + 1);
      return;
    }

    const newPath = matchingEntityObjectState
      ? `${partialPath !== '' ? `${partialPath}/` : ''}${newValueName}`
      : newValueName;
    setPath(newPath);
    setPartialPath(newPath);

    const matchingProperty = navigationProperties.find((np) =>
      np.Name.endsWith('Nav')
        ? np.Name.slice(0, -3) === newValueName
        : np.Name === newValueName,
    );

    let matchingEntityObject = { path: newPath, matchingEntity: {} };

    if (matchingProperty) {
      const relationship = matchingProperty.Relationship.startsWith('SFOData.')
        ? matchingProperty.Relationship.slice(8)
        : matchingProperty.Relationship;

      const matchingAssociationSet = associationSets.find(
        (as) => as.name === relationship,
      );

      if (matchingAssociationSet) {
        const matchingEndElement = matchingAssociationSet.endElements.find(
          (ee) => ee.Role === matchingProperty.ToRole,
        );

        if (matchingEndElement) {
          const matchingEntity = allEntities.find(
            (e) => e.name === matchingEndElement.EntitySet,
          );
          if (matchingEntity) {
            matchingEntityObject = { path: newPath, matchingEntity };
          }
        }
      }
    }

    setMatchingEntityObjectState(matchingEntityObject);
    setAutocompleteKey((prev) => prev + 1);
  };

  const commonAutocompleteProps = {
    placeholder: 'Property',
    required: true,
    getOptionLabel: (option) => (option ? option.Name || '' : ''),
    onChange: handlePropertyChange,
    name: `property_${fieldIdentifierId}`,
  };

  return (
    <>
      <input
        type='hidden'
        name={`matchingEntityObject_${fieldIdentifierId}`}
        value={
          matchingEntityObjectState
            ? JSON.stringify(matchingEntityObjectState)
            : ''
        }
      />
      <input
        type='hidden'
        name={`fullPath_${fieldIdentifierId}`}
        defaultValue={
          matchingEntityObjectState
            ? matchingEntityObjectState.path
            : property?.Name || ''
        }
      />

      {Object.keys(matchingEntityObjectState?.matchingEntity || {}).length >
        0 && (
        <Card
          sx={{
            height: '36px',
            padding: '0px 12px',
            display: 'flex',
            justifyContent: 'center',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          <Typography>{`${partialPath}/`}</Typography>
        </Card>
      )}

      <Autocomplete
        {...commonAutocompleteProps}
        key={autocompleteKey}
        options={
          Object.keys(matchingEntityObjectState?.matchingEntity || {}).length >
          0
            ? (() => {
                const options = [
                  ...Object.values(
                    matchingEntityObjectState.matchingEntity?.properties
                      ?.properties || {},
                  ).flat(),
                  ...Object.values(
                    matchingEntityObjectState.matchingEntity?.properties
                      ?.navigationProperties || {},
                  ).flat(),
                ].sort((a, b) => a.Name.localeCompare(b.Name));
                return options;
              })()
            : combinedOptions.flatMap(({ group, options }) =>
                options.map((option) => ({
                  ...option,
                  group,
                  key: `${group}-${option.Name || option.type || Math.random()}`,
                })),
              )
        }
        value={property || null}
        groupBy={
          !matchingEntityObjectState ? (option) => option.group : undefined
        }
        isOptionEqualToValue={
          !matchingEntityObjectState
            ? (option, value) => option.Name === value?.Name
            : undefined
        }
        sx={{
          ...AUTOCOMPLETE_STYLES,
          ...(matchingEntityObjectState && {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }),
        }}
      />
      <Select
        name={`operator_${fieldIdentifierId}`}
        value={operator || ''}
        onChange={(e, newValue) => setOperator(newValue)}
        required
        sx={SELECT_STYLES}
      >
        <Option value='' disabled>
          Operator
        </Option>
        {OPERATOR_OPTIONS.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
      <PropertyTypeInput
        propertyType={property?.Type || property?.type}
        name={`value_${fieldIdentifierId}`}
        value={value}
        onChange={handleValueChange}
        placeholder='Enter a value'
        operator={operator}
        required
        {...props}
      />
    </>
  );
}

DropdownsAndInput.propTypes = {
  propertyOptionsId: PropTypes.number.isRequired,
  fieldIdentifierId: PropTypes.string.isRequired,
};
