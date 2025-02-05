import PropTypes from 'prop-types';

export default function Steps({ currentStep, steps }) {
  return (
    <div className='flex justify-center space-x-2'>
      {steps.map((step, index) => (
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
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
};
