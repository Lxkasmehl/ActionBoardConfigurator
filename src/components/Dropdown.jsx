import PropTypes from 'prop-types';

export default function Dropdown({ id, options, defaultValue, onChange }) {
  const handleChange = (event) => {
    const selectedValue = event.target.value;
    onChange(selectedValue);
  };

  return (
    <select
      id={id}
      className='bg-gray-600 text-white rounded px-2 py-1 w-40'
      onChange={handleChange}
    >
      <option value='' disabled selected>
        {defaultValue}
      </option>
      {options.map((option) => (
        <option key={option.name} value={option.name}>
          {option['sap:label']}
        </option>
      ))}
    </select>
  );
}

Dropdown.propTypes = {
  id: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  defaultValue: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
