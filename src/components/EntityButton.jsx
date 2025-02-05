import PropTypes from 'prop-types';

export default function EntityButton({ entity, isSelected, onClick }) {
  return (
    <button
      onClick={() => onClick(entity)}
      className={`m-2 px-4 py-2 border rounded-full ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
    >
      {entity['sap:label']}
    </button>
  );
}

EntityButton.propTypes = {
  entity: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};
