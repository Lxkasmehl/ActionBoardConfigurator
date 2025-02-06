import SelectionButton from './SelectionButton';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

export default function Selection({ items, isSelectedSelector, onClick }) {
  const dispatch = useDispatch();

  const handleItemClick = (item) => {
    dispatch(onClick(item));
  };

  return (
    <div className='flex justify-center mt-8'>
      <div className='max-w-5xl flex justify-center flex-wrap'>
        {items.map((item) => (
          <SelectionButton
            key={item.name}
            object={item}
            isSelected={isSelectedSelector(item)}
            onClick={() => handleItemClick(item)}
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
