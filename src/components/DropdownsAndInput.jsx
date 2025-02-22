import { useState, useMemo } from 'react';
import { Autocomplete, Input, Select, Option } from '@mui/joy';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useReactFlow } from '@xyflow/react';
import { OPERATOR_OPTIONS } from './dropdownsAndInput.constants';

export default function DropdownsAndInput({
  propertyOptionsId,
  fieldIdentifierId,
  ...props
}) {
  const propertyOptions = useSelector(
    (state) => state.entities.propertyOptions[propertyOptionsId] || [],
  );
  const sortedPropertyOptions = useMemo(
    () => [...propertyOptions].sort((a, b) => a.Name.localeCompare(b.Name)),
    [propertyOptions],
  );

  const rawFormData = useSelector((state) => state.entities.rawFormData);

  const [property, setProperty] = useState(() => {
    const storedPropertyName =
      rawFormData[propertyOptionsId]?.[`property_${fieldIdentifierId}`];
    return storedPropertyName
      ? propertyOptions.find((prop) => prop.Name === storedPropertyName) || null
      : null;
  });

  const [operator, setOperator] = useState(
    rawFormData[propertyOptionsId]?.[`operator_${fieldIdentifierId}`] ?? '',
  );
  const [value, setValue] = useState(
    rawFormData[propertyOptionsId]?.[`value_${fieldIdentifierId}`] ?? '',
  );

  const config = useSelector((state) => state.entities.config);

  const { getEdges } = useReactFlow();
  const edges = getEdges();

  const relatedSourceIds = edges
    .filter((edge) => edge.target === propertyOptionsId)
    .map((edge) => edge.source);

  const propertyOptionsState = useSelector(
    (state) => state.entities.propertyOptions,
  );

  const sourcePropertyOptions = useMemo(
    () =>
      relatedSourceIds.flatMap(
        (sourceId) => propertyOptionsState[sourceId] || [],
      ),
    [propertyOptionsState, relatedSourceIds],
  );

  const relatedSourceSelectedProperties = relatedSourceIds.flatMap((sourceId) =>
    (config[sourceId] ? Object.values(config[sourceId]) : []).flatMap(
      (entity) =>
        (entity.selectedProperties || []).map(
          (propertyName) =>
            sourcePropertyOptions.find(
              (prop) => prop.Name === propertyName,
            ) || { name: propertyName },
        ),
    ),
  );

  const relatedSourceEntities = relatedSourceIds.flatMap((sourceId) =>
    config[sourceId] ? Object.keys(config[sourceId]) : [],
  );

  const groupedAvailableProperties = sortedPropertyOptions.reduce(
    (acc, prop) => {
      const label = prop.Name;
      const firstLetter = label[0].toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(prop);
      return acc;
    },
    {},
  );

  const combinedOptions = [
    ...relatedSourceEntities.map((entity) => {
      const relevantProperties = relatedSourceSelectedProperties.filter(
        (prop) =>
          relatedSourceIds.some(
            (sourceId) =>
              config[sourceId] &&
              Object.keys(config[sourceId]).some(
                (entityConfig) =>
                  entityConfig === entity &&
                  config[sourceId][entityConfig]?.selectedProperties?.includes(
                    prop.Name,
                  ),
              ),
          ),
      );

      return {
        group: `Selected Props of ${entity}`,
        options: relevantProperties,
      };
    }),
    ...Object.keys(groupedAvailableProperties)
      .sort()
      .map((letter) => ({
        group: letter,
        options: groupedAvailableProperties[letter],
      })),
  ];

  console.log(property);

  return (
    <>
      <Autocomplete
        name={`property_${fieldIdentifierId}`}
        options={combinedOptions.flatMap(({ group, options }) =>
          options.map((option) => ({
            ...option,
            group,
            key: `${group}-${option.Name}`,
          })),
        )}
        groupBy={(option) => option.group}
        getOptionLabel={(option) => (option ? option.Name || '' : '')}
        value={property || null}
        onChange={(e, newValue) => setProperty(newValue)}
        placeholder='Property'
        required
        isOptionEqualToValue={(option, value) => option.Name === value?.Name}
        sx={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          width: 200,
        }}
      />
      <Select
        name={`operator_${fieldIdentifierId}`}
        value={operator || ''}
        onChange={(e, newValue) => setOperator(newValue)}
        required
        sx={{
          borderRadius: 0,
          width: 120,
        }}
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
      <Input
        name={`value_${fieldIdentifierId}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Enter a value'
        required
        sx={{
          borderRadius: 0,
          width: 170,
        }}
        {...props}
      />
    </>
  );
}

DropdownsAndInput.propTypes = {
  propertyOptionsId: PropTypes.number.isRequired,
  fieldIdentifierId: PropTypes.string.isRequired,
};
