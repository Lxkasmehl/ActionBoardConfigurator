import { test, expect } from '@playwright/test';
import {
  editCell,
  setupTable,
  configureTableColumn,
  verifyTableHasData,
  verifyTableColumnCount,
  verifyColumnDataPattern,
} from '../helpers/tableHelpers';

test.describe('Table Tests', () => {
  let previewArea;

  test.beforeEach(async ({ page }) => {
    // Navigate to the UIBuilder page
    await page.goto('http://localhost:5173/#/ui-builder');

    // Get preview area
    previewArea = page.getByTestId('preview-area');
    await expect(previewArea).toBeVisible();
  });

  test('fill table with custom data', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    const { table } = await setupTable(page, previewArea);

    // Fill first column
    await editCell(table, 0, 0, 'Test Data 1-1');
    await editCell(table, 1, 0, 'Test Data 1-2');

    // Fill second column
    await editCell(table, 0, 1, 'Test Data 2-1');
    await editCell(table, 1, 1, 'Test Data 2-2');
  });

  test('fill table with fetched data without dataPicker', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    const { table } = await setupTable(page, previewArea);

    await configureTableColumn(page, table, 0, {
      label: 'User - UserId',
      entity: 'User',
      property: 'userId',
    });

    // Verify table has data loaded
    await verifyTableHasData(page, table);

    // Verify we have the expected number of columns
    await verifyTableColumnCount(page, table, 4);

    // Verify the first column contains alphanumeric data (not necessarily UUIDs)
    await verifyColumnDataPattern(page, table, 1, /^[a-zA-Z0-9_-]+$/);
  });

  test('fill table with fetched data with dataPicker', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    test.setTimeout(90000);
    const { table } = await setupTable(page, previewArea);

    await configureTableColumn(page, table, 0, {
      label: 'User - UserId',
      entity: 'User',
      property: 'userId',
      useDataPicker: true,
    });

    // Verify table has data loaded
    await verifyTableHasData(page, table);

    // Verify we have the expected number of columns
    await verifyTableColumnCount(page, table, 4);

    // Verify the first column contains alphanumeric data (not necessarily UUIDs)
    await verifyColumnDataPattern(page, table, 1, /^[a-zA-Z0-9_-]+$/);
  });

  test('fill table with fetched data from different entities and connect via relation and delete column', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    test.setTimeout(120000);
    const { table } = await setupTable(page, previewArea);

    await configureTableColumn(page, table, 0, {
      label: 'User - userId',
      entity: 'User',
      property: 'userId',
      mainEntity: true,
    });

    await configureTableColumn(page, table, 1, {
      label: 'User - addressLine1',
      entity: 'User',
      property: 'addressLine1',
    });

    await configureTableColumn(page, table, 2, {
      label: 'EmpEmployment - employmentId',
      entity: 'EmpEmployment',
      property: 'employmentId',
      relationship: 'EmpEmployment -> userId -> User',
    });

    const columnHeader = table.locator('.MuiDataGrid-columnHeader').nth(3);
    await columnHeader.hover();
    const menuButton = columnHeader.locator('.MuiDataGrid-menuIconButton');
    await menuButton.click();
    const editColumnMenuItem = page
      .locator('li[role="menuitem"]')
      .filter({ hasText: 'Delete Column' });
    await editColumnMenuItem.click();

    // Verify table has data loaded
    await verifyTableHasData(page, table);

    // Verify we have the expected number of columns (3 after deleting one)
    await verifyTableColumnCount(page, table, 3);

    // Verify the first column contains alphanumeric data (not necessarily UUIDs)
    await verifyColumnDataPattern(page, table, 1, /^[a-zA-Z0-9_-]+$/);

    // Verify the second column contains address data
    await verifyColumnDataPattern(page, table, 2, /^.+$/);

    // Verify the third column contains numeric employment IDs
    await verifyColumnDataPattern(page, table, 3, /^\d+$/);
  });
});
