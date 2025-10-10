import { test, expect } from '@playwright/test';
import { setupBasePage, setupFlowConnection } from '../helpers/flowSetup';
import { selectFromAutocomplete } from '../../../../../shared/helpers/autocompleteHelper';

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

test('handle parallel request limit with multiple flows', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Test runs only in Chromium');
  test.setTimeout(120000);

  await setupBasePage(page);

  for (let i = 0; i < 14; i++) {
    await page.locator('button svg[data-testid="AddIcon"]').click();
  }

  const sections = page.getByTestId('entity-section').all();
  const allSections = await sections;

  for (const section of allSections) {
    await page
      .getByTestId('flow-start')
      .locator('div[class*="source"]')
      .click();
    await section.locator('div[class*="target"]').click();
  }

  for (let i = 0; i < 15; i++) {
    await selectFromAutocomplete(
      page,
      'entity-autocomplete',
      'FOBusinessUnit',
      i,
    );
  }

  let inFlightRequests = 0;
  let maxInFlightRequests = 0;
  const requestTimes = [];

  await page.route('**/api/**', async (route) => {
    const startTime = new Date();
    inFlightRequests++;
    maxInFlightRequests = Math.max(maxInFlightRequests, inFlightRequests);

    console.log(
      `[${startTime.toISOString()}] Request #${inFlightRequests} started`,
    );

    await new Promise((resolve) => setTimeout(resolve, 100));
    await route.continue();

    const endTime = new Date();
    requestTimes.push({
      start: startTime,
      end: endTime,
      duration: endTime - startTime,
    });

    inFlightRequests--;
    console.log(
      `[${endTime.toISOString()}] Request completed. Duration: ${endTime - startTime}ms`,
    );
  });

  await page.getByTestId('send-request-button').click();

  await expect(page.getByText('[62]')).toHaveCount(15, { timeout: 10000 });

  expect(maxInFlightRequests).toBeLessThanOrEqual(10);

  console.log('Request Statistiken:', {
    totalRequests: requestTimes.length,
    maxConcurrent: maxInFlightRequests,
    averageDuration:
      requestTimes.reduce((acc, curr) => acc + curr.duration, 0) /
      requestTimes.length,
  });
});
