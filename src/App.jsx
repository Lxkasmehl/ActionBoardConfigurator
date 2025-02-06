import { useSelector } from 'react-redux';
import Steps from './components/Steps';
import EntitySelection from './components/EntitySelection';
import PropertySelection from './components/PropertySelection.jsx';
import useFetchEntities from './hooks/useFetchEntities.js';

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
  const currentStep = useSelector((state) => state.entities.currentStep);
  const loading = useFetchEntities(relevantEntityNames);

  if (loading) {
    return <p>Loading data...</p>;
  }

  return (
    <div className='flex flex-col w-screen h-screen justify-center content-center py-20'>
      <div className='w-full'>
        <Steps currentStep={currentStep} totalSteps={3} />
        <div className='mt-8 text-center'>
          <h2 className='text-2xl font-semibold'>
            {currentStep === 0 && 'Pick Entity'}
            {currentStep === 1 && 'Filter Entity By Property'}
          </h2>
        </div>
      </div>

      {currentStep === 0 && <EntitySelection />}
      {currentStep === 1 && <PropertySelection />}
    </div>
  );
}
