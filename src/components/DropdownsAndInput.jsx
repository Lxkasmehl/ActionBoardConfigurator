import { useState } from 'react';
import { Autocomplete, Select, Option } from '@mui/joy';
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

  const handleValueChange = (e) => {
    setValue(typeof e === 'object' && e.target ? e.target.value : e);
  };

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
        sx={AUTOCOMPLETE_STYLES}
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
