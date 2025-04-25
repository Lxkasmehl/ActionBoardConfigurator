import { test, expect } from '@playwright/test';
import { setupComponentsInPreview } from '../helpers/setupHelpers';
import { createAndVerifyGroup, editGroup } from '../helpers/groupHelpers';
import { setupAndCreateGroup } from '../helpers/setupHelpers';
import { verifyBorderColorsDifferent } from '../helpers/uiHelpers';
import { configureTableColumn } from '../helpers/tableHelpers';
import { selectFromAutocomplete } from '../../../helpers/autocompleteHelper';

test.describe('Group Tests', () => {
  let previewArea;

  test.beforeEach(async ({ page }) => {
    // Navigate to the UIBuilder page
    await page.goto('http://localhost:5173/ui-builder');

    // Get preview area
    previewArea = page.getByTestId('preview-area');
    await expect(previewArea).toBeVisible();
  });

  test('create group with chart, filterArea, buttonBar, table', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const componentTypes = ['chart', 'filterArea', 'buttonBar', 'table'];
    const sortableComponents = await setupComponentsInPreview(
      page,
      previewArea,
      componentTypes,
    );

    await createAndVerifyGroup(
      page,
      Object.values(sortableComponents),
      'Test Group',
    );
  });

  test('create two groups with table and buttonBar', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const groupTypes = ['buttonBar', 'table'];
    const firstGroup = await setupAndCreateGroup(
      page,
      previewArea,
      groupTypes,
      'Test Group 1',
    );
    const secondGroup = await setupAndCreateGroup(
      page,
      previewArea,
      groupTypes,
      'Test Group 2',
    );

    expect(firstGroup.borderColor).not.toBe(secondGroup.borderColor);
  });

  test('create two groups with table and buttonBar and edit the two groups', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const groupTypes = ['buttonBar', 'table'];
    const firstGroup = await setupAndCreateGroup(
      page,
      previewArea,
      groupTypes,
      'Test Group 1',
    );
    const secondGroup = await setupAndCreateGroup(
      page,
      previewArea,
      groupTypes,
      'Test Group 2',
    );

    expect(firstGroup.borderColor).not.toBe(secondGroup.borderColor);

    // Edit groups
    await editGroup(page, 'Test Group 1', [0]);
    await editGroup(page, 'Test Group 2', [0, 1]);
    await editGroup(page, 'Test Group 1', [1]);

    // Verify border colors after editing
    await verifyBorderColorsDifferent(page, firstGroup, secondGroup);
  });

  test('fill chart component with actual data', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1920 });
    test.setTimeout(120000);

    const componentTypes = ['chart', 'table'];
    const sortableComponents = await setupComponentsInPreview(
      page,
      previewArea,
      componentTypes,
    );

    await createAndVerifyGroup(
      page,
      Object.values(sortableComponents),
      'Test Group',
    );

    await configureTableColumn(page, sortableComponents.table, 0, {
      label: 'User - UserId',
      entity: 'User',
      property: 'userId',
      mainEntity: true,
    });

    await configureTableColumn(page, sortableComponents.table, 1, {
      label: 'User - addressLine1',
      entity: 'User',
      property: 'addressLine1',
    });

    await configureTableColumn(page, sortableComponents.table, 2, {
      label: 'User - gender',
      entity: 'User',
      property: 'gender',
    });

    const columnHeader = sortableComponents.table
      .locator('.MuiDataGrid-columnHeader')
      .nth(3);
    await columnHeader.hover();
    const menuButton = columnHeader.locator('.MuiDataGrid-menuIconButton');
    await menuButton.click();
    const editColumnMenuItem = page
      .locator('li[role="menuitem"]')
      .filter({ hasText: 'Delete Column' });
    await editColumnMenuItem.click();

    await page.getByTestId('chart-edit-button').click();

    await selectFromAutocomplete(
      page,
      'chart-data-source-select',
      'User - gender',
      0,
      {
        useSection: false,
      },
    );

    await page.getByTestId('chart-save-button').click();

    // Verify chart has exactly 6 bars
    const chartBars = page.locator('.MuiBarElement-root');
    await expect(chartBars).toHaveCount(6);

    // Get all bars and their values
    const bars = await chartBars.all();

    // Get x-axis labels
    const xAxisLabels = await page
      .locator('.MuiChartsAxis-directionX')
      .allTextContents();

    // Split the single string into individual characters and filter out empty strings
    const labels = xAxisLabels[0]
      .split('')
      .map((label) => (label === ' ' ? '' : label))
      .filter((label, index, array) => {
        // Keep empty strings from spaces at start and end
        if (index === 0 || index === array.length - 1) return true;
        // For middle elements, only keep non-empty strings
        return label !== '';
      });

    // Expected values
    const expectedValues = {
      '': 185,
      M: 494,
      F: 316,
      U: 3,
      D: 1,
      O: 1,
    };

    // Verify each bar's value
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      const label = labels[i] || '';
      const expectedValue = expectedValues[label];

      // Skip hovering for values less than 3
      if (expectedValue >= 3) {
        // Hover over the bar to see its value
        await bar.hover();

        // Wait for tooltip to appear and get its value
        const tooltip = page.locator('.MuiChartsTooltip-root');
        const tooltipText = await tooltip.textContent();
        const actualValue = parseInt(tooltipText.match(/\d+/)[0]);

        expect(actualValue).toBe(expectedValue);
      }
    }
  });
});
