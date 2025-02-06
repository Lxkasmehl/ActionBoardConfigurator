import SelectionButton from './SelectionButton';
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleEntitySelection,
  setCurrentStep,
} from '../../redux/entitiesSlice';

export default function EntitySelection() {
  const dispatch = useDispatch();
  const selectedEntities = useSelector(
    (state) => state.entities.selectedEntities,
  );
  const relevantEntities = useSelector(
    (state) => state.entities.relevantEntities,
  );
  const currentStep = useSelector((state) => state.entities.currentStep);

  const handleEntityClick = (entity) => {
    dispatch(toggleEntitySelection(entity));
    dispatch(setCurrentStep(currentStep + 1));
  };

  return (
    <div className='flex justify-center mt-8'>
      <div className='max-w-5xl flex justify-center flex-wrap'>
        {relevantEntities.map((entity) => (
          <SelectionButton
            key={entity.name}
            object={entity}
            isSelected={selectedEntities.includes(entity)}
            onClick={handleEntityClick}
          />
        ))}
      </div>
    </div>
  );
}
