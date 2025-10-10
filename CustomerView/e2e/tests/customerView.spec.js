import { test, expect } from '@playwright/test';
import { selectFromJoyAutocomplete } from '../../../shared/helpers/autocompleteHelper.js';

test.describe('CustomerView Tests', () => {
  test('access Recruiter Dashboard 01 from CustomerView and apply simple filters to the table.', async ({
    page,
  }) => {
    // Navigate to the specific config URL
    await page.goto('http://localhost:5174/?config=config_1758940707523');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Click on the job requisition filter autocomplete and select "VP services"
    await selectFromJoyAutocomplete(
      page,
      'filter-autocomplete-job-requisition',
      'VP services',
    );

    // Click the Apply Filter button
    await page.click('[data-testid="button-Apply Filter-0"]');

    // Wait for the table to load and filter
    await page.waitForSelector('[data-testid^="data-grid-"]', {
      timeout: 10000,
    });

    // Get the first column header to identify the column name
    const firstColumnHeader = await page
      .locator('.MuiDataGrid-columnHeader')
      .first();
    const columnName = await firstColumnHeader.textContent();

    // Get all cells in the first column (excluding header)
    const firstColumnCells = page
      .locator('.MuiDataGrid-cell')
      .filter({ hasText: /^(?!.*header)/ });

    // Get all visible cells in the first column
    const firstColumnDataCells = page
      .locator('.MuiDataGrid-row .MuiDataGrid-cell')
      .first();

    // Alternative approach: get all cells in the first column by position
    const allFirstColumnCells = page.locator(
      '.MuiDataGrid-row .MuiDataGrid-cell:first-child',
    );

    // Count total cells in first column (excluding header)
    const cellCount = await allFirstColumnCells.count();

    // Verify that all cells in the first column contain "VP services"
    for (let i = 0; i < cellCount; i++) {
      const cellText = await allFirstColumnCells.nth(i).textContent();
      expect(cellText.trim()).toBe('VP services');
    }

    // Additional verification: check that we have at least some data
    expect(cellCount).toBeGreaterThan(0);

    console.log(
      `Verified ${cellCount} cells in first column all contain "VP services"`,
    );
  });
});
