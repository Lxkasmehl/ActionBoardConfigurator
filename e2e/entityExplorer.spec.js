import { test, expect } from '@playwright/test';

// Gemeinsame Setup-Funktion für die Basis-Navigation
async function setupBasePage(page) {
  await page.goto('http://localhost:5173/');

  await expect(page.getByTestId('entity-section')).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByTestId('flow-start')).toBeVisible({ timeout: 10000 });
}

// Setup für Flow-Verbindungen
async function setupFlowConnection(page) {
  await setupBasePage(page);

  await page.getByTestId('flow-start').locator('div[class*="source"]').click();
  await page
    .getByTestId('entity-section')
    .locator('div[class*="target"]')
    .click();
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
