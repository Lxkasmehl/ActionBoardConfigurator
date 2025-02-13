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

export default function DropdownsAndInput({ id, ...props }) {
  const propertyOptions = useSelector(
    (state) => state.entities.propertyOptions[id] || [],
  );

  return (
    <>
      <Dropdown
        options={propertyOptions.map((p) => ({
          value: p.Name,
          label: p['sap:label'] || p.Name,
        }))}
        defaultValue='Property'
        sx={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          width: 120,
        }}
      />
      <Dropdown
        options={operatorOptions}
        defaultValue='Operator'
        sx={{
          borderRadius: 0,
          width: 120,
        }}
      />
      <Input
        placeholder='Enter a value'
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
  id: PropTypes.number.isRequired,
};
