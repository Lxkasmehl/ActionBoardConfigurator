import { test, expect } from '@playwright/test';
import { setupFlowConnection } from '../helpers/flowSetup';
import {
  selectFromAutocomplete,
  setupFilterCondition,
  setupComplexFilter,
} from '../helpers/filterSetup';

test('create simple flow with one entity section, a simple filter and one selected entity', async ({
  page,
}) => {
  await setupFlowConnection(page);

  await selectFromAutocomplete(
    page,
    'entity-autocomplete',
    'InterviewOverallAssessment',
  );
  await setupFilterCondition(page, 'interviewOverallAssessmentId', '=', '21');
  await selectFromAutocomplete(page, 'property-selector', 'averageRating');

  await page.getByTestId('send-request-button').click();

  await expect(page.getByText('averageRating: 3.75')).toBeVisible();
});

test('use complex filter with one entity section and one selected property', async ({
  page,
}) => {
  await setupFlowConnection(page);
  await selectFromAutocomplete(page, 'entity-autocomplete', 'Business Unit');

  const filterConditions = {
    groupConditions: [
      { property: 'description', operator: '=', value: '123' },
      { property: 'externalCode', operator: '=', value: 'BU_003' },
    ],
    standaloneConditions: [
      {
        property: 'description',
        operator: '=',
        value: 'BUS-0001',
        logic: 'OR',
      },
    ],
  };

  await setupComplexFilter(page, filterConditions);
  await selectFromAutocomplete(page, 'property-selector', 'entityUUID');
  await page.getByTestId('send-request-button').click();
  await page.getByTestId('KeyboardArrowRightIcon').click();

  const expectedUUIDs = [
    '9DB4EFB37AB248A58F29654C3FBE1F25',
    '1AB783D91E8F42E9A6C07756A73530D3',
  ];

  for (const uuid of expectedUUIDs) {
    await expect(page.getByText(`entityUUID: ${uuid}`)).toBeVisible();
  }
});
