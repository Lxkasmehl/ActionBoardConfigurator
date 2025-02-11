import { useState } from 'react';
import useFetchEntities from './hooks/useFetchEntities.js';
import EntitySection from './components/EntitySection.jsx';
import { deleteID } from './redux/entitiesSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

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
  const [sections, setSections] = useState([{ id: 0 }]);
  const dispatch = useDispatch();
  const config = useSelector((state) => state.entities.config);

  const addSection = () => {
    const newId = sections.length
      ? Math.max(...sections.map((s) => s.id)) + 1
      : 0;
    setSections((prev) => [...prev, { id: newId }]);
  };

  const removeSection = (id) => {
    setSections((prev) => prev.filter((section) => section.id !== id));
    dispatch(deleteID(id));
    console.log(config);
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
      <div className='w-full flex flex-col items-center'>
        {sections.map((section, index) => (
          <div key={section.id} className='relative flex flex-col items-center'>
            <EntitySection key={section.id} id={section.id} />
            {index > 0 && (
              <IconButton
                onClick={() => removeSection(section.id)}
                variant='outlined'
                color='danger'
                sx={{
                  position: 'absolute',
                  left: '-60px',
                  top: 'calc(50% - 42px)',
                }}
                //className='absolute left-[-60px] top-[calc(50%-40px)] w-8 h-8 flex items-center justify-center bg-white text-red-600 font-bold rounded-full shadow-md border-2 border-red-600 hover:bg-red-600 hover:text-white transition-all'
              >
                <RemoveIcon />
              </IconButton>
            )}
            <div className='w-0 h-14 mx-auto border-3 border-solid border-[#cdd7e1]'></div>
          </div>
        ))}
        <IconButton
          onClick={addSection}
          variant='outlined'
          aria-label='Add new entity section'
          // className='w-10 h-10 flex items-center justify-center bg-gray-800 text-white rounded-full shadow-md hover:bg-[#eee] transition-all'
        >
          <AddIcon />
        </IconButton>
      </div>
    </div>
  );
}
