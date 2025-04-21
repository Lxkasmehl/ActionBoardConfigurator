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
  await selectFromAutocomplete(page, 'entity-autocomplete', 'FOBusinessUnit');

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

test('use selected properties from one entity section as filter values in another entity section', async ({
  page,
}) => {
  await setupFlowConnection(page);
  await page.locator('button svg[data-testid="AddIcon"]').click();

  const sections = page.getByTestId('entity-section');
  await sections.first().locator('div[class*="source"]').click();
  await sections.last().locator('div[class*="target"]').click();

  await selectFromAutocomplete(
    page,
    'entity-autocomplete',
    'FOBusinessUnit',
    0,
  );
  await setupFilterCondition(page, 'externalCode', '=', 'BU_003', 0);
  await selectFromAutocomplete(page, 'property-selector', 'createdDateTime', 0);

  await selectFromAutocomplete(page, 'entity-autocomplete', 'Candidate', 1);
  await setupFilterCondition(page, 'lastModifiedDateTime', '<', null, 1, true);
  await selectFromAutocomplete(page, 'property-selector', 'lastName', 1);

  await page.getByTestId('send-request-button').click();
  await page.getByTestId('KeyboardArrowRightIcon').click();

  await expect(
    page.getByText(/createdDateTime: 07\.07\.2015, (10:07|15:07)/),
  ).toBeVisible();

  const expectedNames = {
    Watson: 2,
    Zubov: 1,
    'Managing Director': 1,
    Board: 1,
    Hofmann: 1,
    Griffin: 1,
    Granger: 2,
    Jessikowski: 1,
    Richardson: 1,
    Urban: 1,
  };

  for (const [name, count] of Object.entries(expectedNames)) {
    const elements = await page.locator(`text=lastName: ${name}`).all();
    expect(elements).toHaveLength(count);
  }
});
