import { useSelector, useDispatch } from 'react-redux';
import Steps from './components/Steps';
import {
  toggleEntitySelection,
  resetSelectedEntities,
  setCurrentStep,
} from './redux/entitiesSlice.js';
import useFetchEntities from './hooks/useFetchEntities.js';
import Selection from './components/Selection.jsx';
import PropertiesFilter from './components/PropertiesFilter.jsx';

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
  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
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

  const handleNext = () => {
    dispatch(setCurrentStep(currentStep + 1));
  };

  const handleEntityClick = (entity) => {
    dispatch(toggleEntitySelection(entity));
    dispatch(setCurrentStep(currentStep + 1));
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center w-screen h-screen'>
        <div className='animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='flex flex-col w-screen h-full justify-center items-center py-20'>
      <div className='w-full'>
        <Steps totalSteps={3} />
        <div className='mt-8 text-center'>
          <h2 className='text-3xl font-semibold text-gray-700'>
            {currentStep === 0 && 'Pick Entity'}
            {currentStep === 1 && 'Select and Filter Properties'}
          </h2>
        </div>
      </div>

      {currentStep === 0 && (
        <Selection
          items={filteredEntities}
          isSelectedSelector={(entity) => selectedEntities.includes(entity)}
          onClick={handleEntityClick}
        />
      )}

      {currentStep === 1 && selectedEntities.length > 0 && <PropertiesFilter />}

      {currentStep > 0 && (
        <div className='flex justify-center gap-4 mt-6'>
          <button
            onClick={handlePrevious}
            className='px-6 py-3 bg-gray-600 text-white rounded-full shadow-md hover:bg-gray-500 transition duration-300'
          >
            Previous
          </button>

          {currentStep === 1 && (
            <button
              onClick={handleNext}
              className='px-6 py-3 bg-gray-600 text-white rounded-full shadow-md hover:bg-gray-500 transition duration-300'
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
