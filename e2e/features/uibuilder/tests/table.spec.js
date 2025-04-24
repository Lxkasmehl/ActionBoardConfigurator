import { test, expect } from '@playwright/test';
import {
  dragAndVerifyComponent,
  editCell,
} from '../../../helpers/uiBuilderSetup';
import { selectFromAutocomplete } from '../../../helpers/sharedHelper';

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

    // Drag table component to preview area
    const sortableTableComponent = await dragAndVerifyComponent(
      page.getByTestId('draggable-component-table'),
      previewArea,
      'table',
    );

    // Wait for the table to be visible
    const table = sortableTableComponent.locator('.MuiDataGrid-root');
    await expect(table).toBeVisible();

    // Fill first column
    await editCell(0, 0, 'Test Data 1-1');
    await editCell(1, 0, 'Test Data 1-2');

    // Fill second column
    await editCell(0, 1, 'Test Data 2-1');
    await editCell(1, 1, 'Test Data 2-2');
  });

  test('fill table with fetched data without dataPicker', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Drag table component to preview area
    const sortableTableComponent = await dragAndVerifyComponent(
      page.getByTestId('draggable-component-table'),
      previewArea,
      'table',
    );

    // Wait for the table to be visible
    const table = sortableTableComponent.locator('.MuiDataGrid-root');
    await expect(table).toBeVisible();

    // Get the first column header and hover over it to make the menu button visible
    const firstColumnHeader = table
      .locator('.MuiDataGrid-columnHeader')
      .first();
    await firstColumnHeader.hover();

    // Click the menu button
    const menuButton = firstColumnHeader.locator('.MuiDataGrid-menuIconButton');
    await menuButton.click();

    // Click the Edit Column menu item
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

    // Wait for the loading indicator to disappear
    await expect(table.locator('.MuiDataGrid-overlay')).not.toBeVisible();

    // Verify the first 7 rows of data
    const expectedValues = [
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

    // Get all cells in the table
    const cells = await table
      .locator('.MuiDataGrid-cell:not(.MuiDataGrid-cellEmpty)')
      .all();

    // Check first 13 cells (7 rows worth of data)
    for (let i = 0; i < 13; i++) {
      const cellText = await cells[i].textContent();
      expect(cellText).toBe(expectedValues[i]);
    }
  });
});
