import PropTypes from 'prop-types';

export default function SelectionButton({ object, isSelected, onClick }) {
  return (
    <button
      onClick={() => onClick(object)}
      className={`m-2 px-4 py-2 border rounded-full ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
    >
      {object['sap:label']}
    </button>
  );
}

SelectionButton.propTypes = {
  object: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};
