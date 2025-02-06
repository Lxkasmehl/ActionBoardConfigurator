import PropTypes from 'prop-types';

export default function SelectionButton({ object, isSelected, onClick }) {
  return (
    <button
      onClick={() => onClick(object)}
      className={`m-2 px-6 py-3 border rounded-full text-lg font-semibold ${isSelected ? 'bg-gradient-to-r from-blue-400 to-green-400 text-white' : 'bg-gray-200 text-gray-800'} shadow-md hover:shadow-lg transition duration-300`}
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
