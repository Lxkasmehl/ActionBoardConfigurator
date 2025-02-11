import { forwardRef, useImperativeHandle, useState } from 'react';
import PropTypes from 'prop-types';

const Dropdown = forwardRef(function Dropdown(
  { id, options, defaultValue, onChange },
  ref,
) {
  const [selectedValue, setSelectedValue] = useState('');

  const handleChange = (event) => {
    const value = event.target.value;
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
      <select
        id={id}
        className='bg-gray-600 text-white rounded px-2 py-1 w-40'
        value={selectedValue}
        onChange={handleChange}
      >
        <option value='' disabled>
          {defaultValue}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
