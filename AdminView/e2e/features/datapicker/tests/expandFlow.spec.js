import { test, expect } from '@playwright/test';
import { setupFlowConnection } from '../helpers/flowSetup';
import {
  setupExpand,
  setupNestedFilterCondition,
  setupFilterCondition,
} from '../helpers/filterSetup';
import { selectFromAutocomplete } from '../../../../../shared/helpers/autocompleteHelper';

test('use expand with selected property with simple flow and simple filter', async ({
  page,
}) => {
  await setupFlowConnection(page);

  await selectFromAutocomplete(
    page,
    'entity-autocomplete',
    'InterviewOverallAssessment',
  );
  await setupFilterCondition(page, 'interviewOverallAssessmentId', '=', '21');
  await selectFromAutocomplete(
    page,
    'property-selector',
    'interviewIndividualAssessment',
  );

  await setupExpand(page, 'interviewIndividualAssessment', 'refId');

  await page.getByTestId('send-request-button').click();
  await page.getByTestId('KeyboardArrowRightIcon').click();

  await expect(page.getByText('refId: 282')).toBeVisible();
  await expect(page.getByText('refId: 310')).toBeVisible();
  await expect(page.getByText('refId: 273')).toBeVisible();
  await expect(page.getByText('refId: 301')).toBeVisible();
  await expect(page.getByText('refId: 285')).toBeVisible();
});

test('use expand in filter', async ({ page }) => {
  test.setTimeout(60000);
  await setupFlowConnection(page);
  await selectFromAutocomplete(page, 'entity-autocomplete', 'FOBusinessUnit');

  await setupNestedFilterCondition(
    page,
    ['createdByNav', 'email'],
    '=',
    'sf.support@pentos.com',
  );

  await selectFromAutocomplete(page, 'property-selector', 'createdByNav');
  await setupExpand(page, 'createdByNav', 'displayName');

  await page.getByTestId('send-request-button').click();
  await page.getByTestId('KeyboardArrowRightIcon').click();

  const expectedNameCounts = {
    'AdminPentosDI TU': 11,
    'AdminPentosCW TU': 3,
    'AdminPentosEC TU': 2,
  };

  for (const [displayName, expectedCount] of Object.entries(
    expectedNameCounts,
  )) {
    const elements = page.getByText(
      `createdByNav: displayName: ${displayName}`,
      { exact: true },
    );
    await expect(elements).toHaveCount(expectedCount);
  }
});
