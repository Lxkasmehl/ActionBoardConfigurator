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

  test('fill table with fetched data without dataPicker', async ({
    page,
  }, testInfo) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    const { table } = await setupTable(page, previewArea);

    await configureTableColumn(page, table, 0, {
      label: 'User - UserId',
      entity: 'User',
      property: 'userId',
    });

    await verifyTableData(
      page,
      table,
      [
        /^(6c701150-dff5-4762-bc7f-8c8e78ab729f| |)$/,
        'John Smith',
        'M',
        'USA',
        /^(162|kkkkCHE)$/,
        'Sarah Johnson',
        'F',
        'Canada',
        /^(llllCHE|kkkkCHE)$/,
        '',
        '',
        '',
        /^(llllCHE|10033376)$/,
        '',
        '',
        '',
        /^(ttttLMS2|10033376|ttttrec1)$/,
        '',
        '',
        '',
        /^(ppppqui|ttttrec1|pppprec1|ttttUSA|ttttrec2)$/,
        '',
        '',
        '',
        /^(ttttrec2|ttttrec1|pppprec1|pppprec2|tttt_TAL|ttttrec3)$/,
        '',
        '',
        '',
      ],
      testInfo,
    );
  });

  test('fill table with fetched data with dataPicker', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    test.setTimeout(90000);
    const { table } = await setupTable(page, previewArea);

    await configureTableColumn(
      page,
      table,
      0,
      {
        label: 'User - UserId',
        entity: 'User',
        property: 'userId',
        useDataPicker: true,
      },
      testInfo,
    );

    await verifyTableData(
      page,
      table,
      [
        '6c701150-dff5-4762-bc7f-8c8e78ab729f',
        'John Smith',
        'M',
        'USA',
        /^(kkkkCHE|162)$/,
        'Sarah Johnson',
        'F',
        'Canada',
        /^(kkkkCHE|llllCHE)$/,
        '',
        '',
        '',
        /^(10033376|llllCHE)$/,
        '',
        '',
        '',
        /^(10033376|ttttLMS2|ttttrec1)$/,
        '',
        '',
        '',
        /^(ttttqui|ppppqui|ttttrec1|pppprec1|ttttUSA|ttttrec2)$/,
        '',
        '',
        '',
        /^(ttttrec1|pppprec1|ttttrec2|tttt_TAL|ttttrec3)$/,
        '',
        '',
        '',
      ],
      testInfo,
    );
  });

  test('fill table with fetched data from different entities and connect via relation and delete column', async ({
    page,
  }, testInfo) => {
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

    await verifyTableData(
      page,
      table,
      [
        /^(6c701150-dff5-4762-bc7f-8c8e78ab729f| |)$/,
        '',
        '',
        /^(162|kkkkCHE)$/,
        /^(Zürichbergstr. 7| |)$/,
        /^(2641|1478)$/,
        /^(kkkkCHE|llllCHE)$/,
        'Zürichbergstr. 7',
        /^(1478|1479)$/,
        /^(llllCHE|10033376)$/,
        'Landsberger Str. 110',
        '5660',
        /^(ttttqui|ppppqui|pppprec1|ttttrec1|ttttLMS2)$/,
        'Landsberger Str. 110',
        /^(4959|4955|4295|4152)$/,
        /^(ttttrec1|pppprec1|ttttrec2|ttttUSA)$/,
        /^(Landsberger Str. 110|Zürichbergstr. 7|645 Dolcetto Drive)$/,
        /^(4295|4291|4321|1460)$/,
      ],
      testInfo,
    );
  });
});
