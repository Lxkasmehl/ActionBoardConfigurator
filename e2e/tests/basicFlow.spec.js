import { test, expect } from '@playwright/test';
import { setupBasePage, setupFlowConnection } from '../helpers/flowSetup';

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
