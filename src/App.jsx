import useFetchEntities from './hooks/useFetchEntities.js';
import EntitySection from './components/EntitySection.jsx';

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
  const loading = useFetchEntities(relevantEntityNames);

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
        <div className='flex items-center flex-col'>
          <EntitySection />
          <div className='w-0 h-14 mx-auto border-3 border-solid border-[#eee]'></div>
        </div>
      </div>
    </div>
  );
}
