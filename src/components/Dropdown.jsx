import { forwardRef, useImperativeHandle, useState } from 'react';
import PropTypes from 'prop-types';
import { Select, Option } from '@mui/joy';

const Dropdown = forwardRef(function Dropdown(
  { id, options, defaultValue, onChange, multiple = false, ...props },
  ref,
) {
  const [selectedValue, setSelectedValue] = useState(['']);

  const handleChange = (event, value) => {
    if (multiple) {
      let updatedValue = [...selectedValue];
      const addedValue = value.find((val) => !selectedValue.includes(val));
      const removedValue = selectedValue.find((val) => !value.includes(val));

      if (addedValue) {
        updatedValue.push(addedValue);
      }

      if (removedValue) {
        updatedValue = updatedValue.filter((val) => val !== removedValue);
      }

      if (updatedValue.length === 0) {
        updatedValue = [''];
        setSelectedValue(updatedValue);
      } else {
        setSelectedValue(updatedValue.filter((val) => val !== ''));
      }

      onChange(addedValue || removedValue);
    } else {
      setSelectedValue([value]);
      if (onChange) {
        onChange(value);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    resetDropdown() {
      setSelectedValue(['']);
    },
  }));

  return (
    <div>
      <Select
        id={id}
        className='w-48'
        value={multiple ? selectedValue : selectedValue[0]}
        onChange={handleChange}
        multiple={multiple}
        {...props}
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
  id: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  defaultValue: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  multiple: PropTypes.bool,
};
