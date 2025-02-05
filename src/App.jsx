import { useEffect, useState } from 'react';

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

const steps = ['Step 1', 'Step 2', 'Step 3'];

const fetchData = async () => {
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + btoa(`${API_USER}:${API_PASSWORD}`));
  headers.set('X-SF-Correlation-Id', crypto.randomUUID());
  headers.set('successfactors-sourcetype', 'Application');

  let allData = [];
  let url = '/api/odata/v2/$metadata';

  try {
    while (url) {
      const response = await fetch(url, {
        mode: 'cors',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error('Error while fetching data');
      }

      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'application/xml');

      console.log(xmlDoc);

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
  const [relevantEntities, setRelevantEntities] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEntities, setSelectedEntities] = useState([]);

  const handleEntityClick = (entity) => {
    setSelectedEntities((prev) =>
      prev.includes(entity)
        ? prev.filter((item) => item !== entity)
        : [...prev, entity],
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  useEffect(() => {
    fetchData().then(setRelevantEntities);
  }, []);

  if (!relevantEntities) {
    return <p>Loading data...</p>;
  }

  console.log(relevantEntities);

  return (
    <div className='p-40'>
      <div className='w-full py-4'>
        <div className='flex justify-center space-x-2'>
          {steps.map((step, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>
        <div className='mt-8 text-center'>
          <h2 className='text-2xl font-semibold'>{steps[currentStep]}</h2>
        </div>
      </div>

      {currentStep === 0 && (
        <div className='flex flex-wrap justify-center mt-8'>
          {relevantEntities.map((entity) => (
            <button
              key={entity.name}
              onClick={() => handleEntityClick(entity)}
              className={`m-2 px-4 py-2 border rounded-full ${
                selectedEntities.includes(entity)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {entity['sap:label']}
            </button>
          ))}
        </div>
      )}

      <div className='flex justify-center mt-8'>
        <button
          onClick={handleNext}
          className='px-6 py-2 bg-blue-500 text-white rounded-lg'
        >
          Next
        </button>
      </div>
    </div>
  );
}
