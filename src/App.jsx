import { useSelector, useDispatch } from 'react-redux';
import Steps from './components/Steps';
import EntitySelection from './components/EntitySelection';
import PropertySelection from './components/PropertySelection.jsx';
import useFetchEntities from './hooks/useFetchEntities.js';
import {
  setCurrentStep,
  resetSelectedEntities,
} from './redux/entitiesSlice.js';

const relevantEntityNames = new Set([
  'User',
  'EmpEmployment',
  'EmpJob',
  'EmpCompensation',
  'WorkSchedule',
  'TimeAccount',
  'EmployeeTime',
  'JobRequisition',
  'JobApplication',
  'Candidate',
  'JobOffer',
  'InterviewOverallAssessment',
  'OnboardingInfo',
  'ONB2Process',
  'ONB2ProcessTask',
  'ONB2ProcessTrigger',
  'Goal',
  'GoalAchievements',
  'FormReviewFeedback',
  'ContinuousFeedback',
  'TalentPool',
  'Successor',
  'MentoringProgram',
  'DevGoal',
  'FOCompany',
  'FOBusinessUnit',
  'FODepartment',
  'FOCostCenter',
]);

export default function App() {
  const dispatch = useDispatch();
  const currentStep = useSelector((state) => state.entities.currentStep);
  const selectedEntities = useSelector(
    (state) => state.entities.selectedEntities,
  );
  const loading = useFetchEntities(relevantEntityNames);

  const handlePrevious = () => {
    if (currentStep === 1) {
      dispatch(resetSelectedEntities());
    }

    dispatch(setCurrentStep(currentStep - 1));
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center w-screen h-screen'>
        <div className='animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='flex flex-col w-screen h-screen justify-center content-center py-20'>
      <div className='w-full'>
        <Steps currentStep={currentStep} totalSteps={3} />
        <div className='mt-8 text-center'>
          <h2 className='text-2xl font-semibold'>
            {currentStep === 0 && 'Pick Entity'}
            {currentStep === 1 && `Properties of ${selectedEntities[0].name}`}
          </h2>
        </div>
      </div>

      {currentStep === 0 && <EntitySelection />}
      {currentStep === 1 && <PropertySelection />}

      {currentStep > 0 && (
        <div className='flex justify-center'>
          <button
            onClick={handlePrevious}
            className='mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400'
          >
            Previous
          </button>
        </div>
      )}
    </div>
  );
}
