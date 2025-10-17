import { test, expect } from '@playwright/test';
import { selectFromAutocomplete } from '../../../shared/helpers/autocompleteHelper.js';

test.describe('CustomerView Tests', () => {
  test('access Recruiter Dashboard 01 from CustomerView and apply simple filters to the table.', async ({
    page,
  }) => {
    test.setTimeout(60000);
    // Navigate to the specific config URL
    // Always use HTTP since we're running tests with HTTP server
    await page.goto(`https://localhost:5174/?config=config_1758940707523`);

    // Wait for the loading text to disappear before taking screenshot
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || document.body.innerText;
        return !bodyText.includes('Loading application configuration...');
      },
      { timeout: 30000 },
    );

    const recruiterDashboardInitialStateScreenshot = await page.screenshot({
      path: 'test-results/recruiter-dashboard-initial-state.png',
      fullPage: true,
    });
    await test.info().attach('recruiter-dashboard-initial-state', {
      body: recruiterDashboardInitialStateScreenshot,
      contentType: 'image/png',
    });

    await selectFromAutocomplete(
      page,
      'filter-autocomplete-job-requisition',
      'VP services',
      0,
      {
        useSection: false,
      },
    );

    await page.getByTestId('button-Apply Filter-0').click();

    const recruiterDashboardScreenshot = await page.screenshot({
      path: 'test-results/recruiter-dashboard-with-filters.png',
      fullPage: true,
    });
    await test.info().attach('recruiter-dashboard-with-filters', {
      body: recruiterDashboardScreenshot,
      contentType: 'image/png',
    });

    // Verify that all visible rows in the DataGrid have "VP services" in the Job Requisition column
    // Use a more specific selector that excludes the header row
    const jobRequisitionCells = page.locator(
      '.MuiDataGrid-cell[data-field="Job Requisition"]:not(.MuiDataGrid-columnHeader)',
    );
    const cellCount = await jobRequisitionCells.count();

    // Assert that we have at least one row
    expect(cellCount).toBeGreaterThan(0);

    // Check that all visible Job Requisition cells contain "VP services"
    for (let i = 0; i < cellCount; i++) {
      const cellText = await jobRequisitionCells.nth(i).textContent();
      expect(cellText).toBe('VP services');
    }

    // Alternative approach: Get all Job Requisition cell texts and verify they all match
    const allJobRequisitionTexts = await jobRequisitionCells.allTextContents();
    allJobRequisitionTexts.forEach((text) => {
      expect(text.trim()).toBe('VP services');
    });

    // Verify that no other job requisitions are visible (excluding header)
    const allVisibleCells = page.locator(
      '.MuiDataGrid-cell[data-field="Job Requisition"]:not(.MuiDataGrid-columnHeader)',
    );
    const allTexts = await allVisibleCells.allTextContents();
    const nonVpServicesCells = allTexts.filter(
      (text) => text.trim() !== 'VP services',
    );
    expect(nonVpServicesCells).toHaveLength(0);
  });
});
