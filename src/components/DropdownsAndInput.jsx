import { useState } from 'react';
import Dropdown from './Dropdown';
import { Input } from '@mui/joy';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const operatorOptions = [
  { value: '=', label: '=' },
  { value: '!=', label: '≠' },
  { value: '<', label: '<' },
  { value: '<=', label: '≤' },
  { value: '>', label: '>' },
  { value: '>=', label: '≥' },
  { value: 'LIKE', label: 'LIKE' },
  { value: 'NOT LIKE', label: 'NOT LIKE' },
  { value: 'IN', label: 'IN' },
  { value: 'NOT IN', label: 'NOT IN' },
  { value: 'BETWEEN', label: 'BETWEEN' },
  { value: 'IS NULL', label: 'IS NULL' },
  { value: 'IS NOT NULL', label: 'IS NOT NULL' },
  { value: 'CONTAINS', label: 'CONTAINS' },
];

export default function DropdownsAndInput({
  propertyOptionsId,
  fieldIdentifierId,
  ...props
}) {
  const propertyOptions = useSelector(
    (state) => state.entities.propertyOptions[propertyOptionsId] || [],
  );
  const rawFormData = useSelector((state) => state.entities.rawFormData);

  const [property, setProperty] = useState(
    rawFormData[propertyOptionsId]?.[`property_${fieldIdentifierId}`] ?? '',
  );
  const [operator, setOperator] = useState(
    rawFormData[propertyOptionsId]?.[`operator_${fieldIdentifierId}`] ?? '',
  );
  const [value, setValue] = useState(
    rawFormData[propertyOptionsId]?.[`value_${fieldIdentifierId}`] ?? '',
  );

  return (
    <>
      <Dropdown
        name={`property_${fieldIdentifierId}`}
        options={propertyOptions.map((p) => ({
          value: p.Name,
          label: p['sap:label'] || p.Name,
        }))}
        value={property}
        onChange={(e, newValue) => setProperty(newValue)}
        defaultValue='Property'
        required
        sx={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          width: 120,
        }}
      />
      <Dropdown
        name={`operator_${fieldIdentifierId}`}
        options={operatorOptions}
        value={operator}
        onChange={(e, newValue) => setOperator(newValue)}
        defaultValue='Operator'
        required
        sx={{
          borderRadius: 0,
          width: 120,
        }}
      />
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
