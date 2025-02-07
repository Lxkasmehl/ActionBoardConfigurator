import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

export default function Steps({ totalSteps }) {
  const currentStep = useSelector((state) => state.entities.currentStep);

  const steps = new Array(totalSteps).fill(null);

  return (
    <div className='flex justify-center space-x-2'>
      {steps.map((_, index) => (
        <div
          key={index}
          className={`h-3 w-3 rounded-full ${index <= currentStep ? 'bg-gradient-to-r from-blue-400 to-green-400' : 'bg-gray-200'} transition-all duration-300`}
        />
      ))}
    </div>
  );
}

Steps.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
};
