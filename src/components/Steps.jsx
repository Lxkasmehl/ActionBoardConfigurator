import PropTypes from 'prop-types';

export default function Steps({ currentStep, totalSteps }) {
  const steps = new Array(totalSteps).fill(null);

  return (
    <div className='flex justify-center space-x-2'>
      {steps.map((_, index) => (
        <div
          key={index}
          className={`h-2 w-2 rounded-full ${index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}
        />
      ))}
    </div>
  );
}

Steps.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
};
