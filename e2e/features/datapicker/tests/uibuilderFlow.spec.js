import { test, expect } from '@playwright/test';
import { setupUIBuilder } from '../helpers/uibuilderSetup';

test.describe('UIBuilder Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupUIBuilder(page);
  });

  test('should load UIBuilder page correctly', async ({ page }) => {
    // Add your test cases here
    await expect(page).toHaveTitle(/UIBuilder/);
  });

  // Add more test cases for UIBuilder functionality
});
