import { forwardRef, useImperativeHandle, useState } from 'react';
import PropTypes from 'prop-types';
import { Select, Option } from '@mui/joy';

const Dropdown = forwardRef(function Dropdown(
  { id, options, defaultValue, onChange },
  ref,
) {
  const [selectedValue, setSelectedValue] = useState('');

  const handleChange = (event, value) => {
    setSelectedValue(value);
    onChange(value);
  };

  useImperativeHandle(ref, () => ({
    resetDropdown() {
      setSelectedValue('');
    },
  }));

  return (
    <div>
      <Select
        id={id}
        // className='bg-gray-600 text-white rounded px-2 py-1 w-40'
        className='w-48'
        value={selectedValue}
        onChange={handleChange}
      >
        <Option value='' disabled>
          {defaultValue}
        </Option>
        {options.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </div>
  );
});

export default Dropdown;

Dropdown.propTypes = {
  id: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  defaultValue: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};
