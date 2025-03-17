import { expect } from '@playwright/test';

export async function setupBasePage(page) {
  await page.goto('http://localhost:5173/');

  await expect(page.getByTestId('entity-section')).toBeVisible({
    timeout: 20000,
  });
  await expect(page.getByTestId('flow-start')).toBeVisible({ timeout: 10000 });
}

export async function setupFlowConnection(page) {
  await setupBasePage(page);

  await page.getByTestId('flow-start').locator('div[class*="source"]').click();
  await page
    .getByTestId('entity-section')
    .locator('div[class*="target"]')
    .click();
}
