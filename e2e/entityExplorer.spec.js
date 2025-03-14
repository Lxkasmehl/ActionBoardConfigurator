import { test, expect } from '@playwright/test';

async function setupBasePage(page) {
  await page.goto('http://localhost:5173/');

  await expect(page.getByTestId('entity-section')).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByTestId('flow-start')).toBeVisible({ timeout: 10000 });
}

async function setupFlowConnection(page) {
  await setupBasePage(page);

  await page.getByTestId('flow-start').locator('div[class*="source"]').click();
  await page
    .getByTestId('entity-section')
    .locator('div[class*="target"]')
    .click();
}

async function selectFromAutocomplete(page, testId, optionName) {
  await page.getByTestId(testId).getByRole('button', { title: 'Open' }).click();
  await page.getByRole('option', { name: optionName }).click();
}

async function setupFilterCondition(page, propertyName, operator, value) {
  await page.getByTestId('add-filter-button').click();
  await page.getByTestId('add-condition-button').click();

  await selectFromAutocomplete(
    page,
    'filter-property-autocomplete',
    propertyName,
  );

  await page.getByTestId('filter-operator-dropdown').click();
  await page.getByRole('option', { name: operator }).click();

  if (value) {
    await page.getByPlaceholder('Enter a value').fill(value);
  }

  await page.getByTestId('filter-modal-save-button').click();
}

test('connect flow start to entity section', async ({ page }) => {
  await setupFlowConnection(page);
  await expect(page.locator('[data-testid^="rf__edge-"]')).toBeVisible();
});

test('connect flow start to entity section and delete edge', async ({
  page,
}) => {
  await setupFlowConnection(page);

  await expect(
    page.locator('button svg[data-testid="ClearIcon"]'),
  ).toBeVisible();
  await page.locator('button svg[data-testid="ClearIcon"]').click();

  await expect(page.locator('[data-testid^="rf__edge-"]')).not.toBeVisible();
});

test('delete entity section', async ({ page }) => {
  await setupBasePage(page);

  await page.locator('button svg[data-testid="RemoveIcon"]').click();

  await expect(page.getByTestId('entity-section')).not.toBeVisible();
  await expect(page.locator('[data-testid^="rf__edge-"]')).not.toBeVisible();
});

test('create new entity section', async ({ page }) => {
  await setupBasePage(page);

  await page.locator('button svg[data-testid="AddIcon"]').click();

  await expect(page.getByTestId('entity-section')).toHaveCount(2);
});

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
