import { test, expect } from '@playwright/test';
import { editCell, setupTable, verifyTableData } from '../helpers/tableHelpers';
import { selectFromAutocomplete } from '../../../helpers/autocompleteHelper';
import { setupFlowConnection } from '../../datapicker/helpers/flowSetup';

// Common expected values for table data
const expectedTableValues = [
  '6c701150-dff5-4762-bc7f-8c8e78ab729f',
  'John Smith',
  'M',
  'USA',
  '162',
  'Sarah Johnson',
  'F',
  'Canada',
  'kkkkCHE',
  '',
  '',
  '',
  'llllCHE',
  '',
  '',
  '',
  '10033376',
  '',
  '',
  '',
  'ttttqui',
  '',
  '',
  '',
  'ttttrec1',
  '',
  '',
  '',
];

test.describe('Table Tests', () => {
  let previewArea;

  test.beforeEach(async ({ page }) => {
    // Navigate to the UIBuilder page
    await page.goto('http://localhost:5173/ui-builder');

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
    await page.setViewportSize({ width: 1920, height: 1080 });
    const { table } = await setupTable(page, previewArea);

    // Configure column
    const firstColumnHeader = table
      .locator('.MuiDataGrid-columnHeader')
      .first();
    await firstColumnHeader.hover();
    const menuButton = firstColumnHeader.locator('.MuiDataGrid-menuIconButton');
    await menuButton.click();
    const editColumnMenuItem = page
      .locator('li[role="menuitem"]')
      .filter({ hasText: 'Edit Column' });
    await editColumnMenuItem.click();

    page
      .getByTestId('column-label-input')
      .locator('input')
      .fill('User - UserId');
    await selectFromAutocomplete(page, 'entity-select', 'User', 0, {
      useSection: false,
    });
    await selectFromAutocomplete(page, 'property-select', 'userId', 0, {
      useSection: false,
    });
    await page.getByTestId('save-button').click();

    await expect(table.locator('.MuiDataGrid-overlay')).not.toBeVisible();
    await verifyTableData(table, expectedTableValues);
  });

  test('fill table with fetched data with dataPicker', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    test.setTimeout(60000);
    const { table } = await setupTable(page, previewArea);

    // Configure column with dataPicker
    const firstColumnHeader = table
      .locator('.MuiDataGrid-columnHeader')
      .first();
    await firstColumnHeader.hover();
    const menuButton = firstColumnHeader.locator('.MuiDataGrid-menuIconButton');
    await menuButton.click();
    const editColumnMenuItem = page
      .locator('li[role="menuitem"]')
      .filter({ hasText: 'Edit Column' });
    await editColumnMenuItem.click();

    await page.getByTestId('data-picker-switch').click();
    const iFrame = page.getByTestId('data-picker-iframe');
    await expect(iFrame).toBeVisible();

    const frameLocator = page.frameLocator(
      '[data-testid="data-picker-iframe"]',
    );
    await setupFlowConnection(frameLocator, true);
    await selectFromAutocomplete(frameLocator, 'entity-autocomplete', 'User');
    await selectFromAutocomplete(frameLocator, 'property-selector', 'userId');

    page
      .getByTestId('column-label-input')
      .locator('input')
      .fill('User - UserId');
    await page.getByTestId('save-button').click();

    await expect(page.getByTestId('edit-modal')).not.toBeVisible({
      timeout: 20000,
    });
    await expect(table.locator('.MuiDataGrid-overlay')).not.toBeVisible();
    await verifyTableData(table, expectedTableValues);
  });
});
