import SelectionButton from './SelectionButton';
import PropTypes from 'prop-types';

export default function Selection({ items, isSelectedSelector, onClick }) {
  return (
    <div className='flex justify-center mt-8'>
      <div className='max-w-5xl flex justify-center flex-wrap'>
        {items.map((item) => (
          <SelectionButton
            key={item['sap:label']}
            object={item}
            isSelected={isSelectedSelector(item)}
            onClick={() => onClick(item)}
          />
        ))}
      </div>
    </div>
  );
}

Selection.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  isSelectedSelector: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};
