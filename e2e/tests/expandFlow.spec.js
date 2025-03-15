import { test, expect } from '@playwright/test';
import { setupFlowConnection } from '../helpers/flowSetup';
import {
  selectFromAutocomplete,
  setupFilterCondition,
} from '../helpers/filterSetup';

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

  await page
    .getByTestId('accordion-interviewIndividualAssessment')
    .locator('button')
    .first()
    .click();

  await selectFromAutocomplete(
    page,
    'accordion-interviewIndividualAssessment-property-selector',
    'refId',
  );

  await page.getByTestId('send-request-button').click();

  await page.getByTestId('KeyboardArrowRightIcon').click();

  await expect(page.getByText('refId: 282')).toBeVisible();
  await expect(page.getByText('refId: 310')).toBeVisible();
  await expect(page.getByText('refId: 273')).toBeVisible();
  await expect(page.getByText('refId: 301')).toBeVisible();
  await expect(page.getByText('refId: 285')).toBeVisible();
});
