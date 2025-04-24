import { test, expect } from '@playwright/test';
import {
  dragAndVerifyComponent,
  editCell,
} from '../../../helpers/uiBuilderSetup';

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
});
