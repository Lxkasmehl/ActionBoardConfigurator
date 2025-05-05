import { test, expect } from '@playwright/test';
import {
  editCell,
  setupTable,
  verifyTableData,
  configureTableColumn,
} from '../helpers/tableHelpers';

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
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    const { table } = await setupTable(page, previewArea);

    await configureTableColumn(page, table, 0, {
      label: 'User - UserId',
      entity: 'User',
      property: 'userId',
    });

    await verifyTableData(table, [
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
      /^(ppppqui|ttttrec1)$/,
      '',
      '',
      '',
      /^(ttttrec2|ttttrec1|pppprec1)$/,
      '',
      '',
      '',
    ]);
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

    await verifyTableData(table, [
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
      /^(ttttqui|ppppqui)$/,
      '',
      '',
      '',
      /^(ttttrec1|pppprec1)$/,
      '',
      '',
      '',
    ]);
  });

  test('fill table with fetched data from different entities and connect via relation and delete column', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    test.setTimeout(90000);
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

    await verifyTableData(table, [
      '6c701150-dff5-4762-bc7f-8c8e78ab729f',
      '',
      '',
      '162',
      '',
      '2641',
      'kkkkCHE',
      'Zürichbergstr. 7',
      '1478',
      'llllCHE',
      'Zürichbergstr. 7',
      '1479',
      '10033376',
      'Landsberger Str. 110',
      '5660',
      /^(ttttqui|ppppqui)$/,
      'Landsberger Str. 110',
      /^(4959|4955)$/,
      'ttttrec1',
      'Landsberger Str. 110',
      '4295',
    ]);
  });
});
