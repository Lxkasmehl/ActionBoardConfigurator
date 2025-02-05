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

const fetchData = async () => {
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + btoa(`${API_USER}:${API_PASSWORD}`));
  headers.set('X-SF-Correlation-Id', crypto.randomUUID());
  headers.set('successfactors-sourcetype', 'Application');

  try {
    const response = await fetch(`/api/odata/v2/$metadata`, {
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
    const filteredMetadata = entitySets
      .filter((entity) =>
        relevantEntities.has(entity.getAttribute('Name') || ''),
      )
      .map((entity) => {
        const attributes = {};
        Array.from(entity.attributes).forEach((attr) => {
          attributes[attr.name.toLowerCase()] = attr.value;
        });
        return attributes;
      });

    return filteredMetadata;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

export default function App() {
  const [relevantEntities, setRelevantEntities] = useState(null);

  useEffect(() => {
    fetchData().then(setRelevantEntities);
  }, []);

  if (!relevantEntities) {
    return <p>Loading data...</p>;
  }

  console.log(relevantEntities);

  return (
    <div>
      <h1>API Entities</h1>
      <ul>
        {relevantEntities.length > 0 ? (
          relevantEntities.map((entity) => (
            <li key={entity.name}>
              <p>{entity.name}</p>
            </li>
          ))
        ) : (
          <p>No relevant entities found.</p>
        )}
      </ul>
    </div>
  );
}
