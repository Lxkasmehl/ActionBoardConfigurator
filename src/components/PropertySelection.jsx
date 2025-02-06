import SelectionButton from './SelectionButton';
import { useDispatch, useSelector } from 'react-redux';
import {
  togglePropertySelection,
  setCurrentStep,
} from '../redux/entitiesSlice';

export default function PropertySelection() {
  const dispatch = useDispatch();
  const selectedEntities = useSelector(
    (state) => state.entities.selectedEntities,
  );
  const selectedProperties = useSelector(
    (state) => state.entities.selectedProperties,
  );
  const currentStep = useSelector((state) => state.entities.currentStep);

  if (selectedEntities.length === 0) return null;

  const handlePropertyClick = (property) => {
    dispatch(togglePropertySelection(property));
    dispatch(setCurrentStep(currentStep + 1));
  };

  return (
    <div className='flex justify-center mt-8'>
      <div className='max-w-5xl flex justify-center flex-wrap'>
        {selectedEntities[0].properties.map((property) => (
          <SelectionButton
            key={property.name}
            object={property}
            isSelected={selectedProperties.includes(property)}
            onClick={handlePropertyClick}
          />
        ))}
      </div>
    </div>
  );
}
