import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setEntities } from '../redux/entitiesSlice';
import Steps from './components/Steps';
import EntitySelection from './components/EntitySelection';
import PropertySelection from './components/PropertySelection.jsx';

const API_USER = import.meta.env.VITE_API_USER;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;

const relevantEntities = new Set([
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

const fetchData = async () => {
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + btoa(`${API_USER}:${API_PASSWORD}`));
  headers.set('X-SF-Correlation-Id', crypto.randomUUID());
  headers.set('successfactors-sourcetype', 'Application');

  let allData = [];
  let url = '/api/odata/v2/$metadata';

  try {
    while (url) {
      const response = await fetch(url, { mode: 'cors', headers });
      if (!response.ok) throw new Error('Error while fetching data');

      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'application/xml');

      const entitySets = Array.from(xmlDoc.getElementsByTagName('EntitySet'));
      const entityTypes = Array.from(xmlDoc.getElementsByTagName('EntityType'));

      const entityTypesMap = new Map();
      entityTypes.forEach((entityType) => {
        const name = entityType.getAttribute('Name');
        const properties = Array.from(
          entityType.getElementsByTagName('Property'),
        ).map((property) => {
          const attributes = {};
          Array.from(property.attributes).forEach((attr) => {
            attributes[attr.name] = attr.value;
          });
          return attributes;
        });
        entityTypesMap.set(name, properties);
      });

      const filteredMetadata = entitySets
        .filter((entity) =>
          relevantEntities.has(entity.getAttribute('Name') || ''),
        )
        .map((entity) => {
          const name = entity.getAttribute('Name');
          const attributes = {};
          Array.from(entity.attributes).forEach((attr) => {
            attributes[attr.name.toLowerCase()] = attr.value;
          });

          if (entityTypesMap.has(name)) {
            attributes.properties = entityTypesMap.get(name);
          }

          return attributes;
        });

      allData = [...allData, ...filteredMetadata];

      const nextLink = response.headers.get('OData-NextLink');
      url = nextLink ? nextLink : null;
    }

    return allData;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

export default function App() {
  const dispatch = useDispatch();
  const relevantEntities = useSelector(
    (state) => state.entities.relevantEntities,
  );
  const currentStep = useSelector((state) => state.entities.currentStep);

  useEffect(() => {
    fetchData().then((data) => dispatch(setEntities(data)));
  }, [dispatch]);

  if (!relevantEntities.length) {
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
