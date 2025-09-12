import { expect } from '@playwright/test';
import { dragAndVerifyComponent } from './componentHelpers';
import { selectFromAutocomplete } from '../../../shared/helpers/autocompleteHelper';
import { setupFlowConnection } from '../../datapicker/helpers/flowSetup';
import fs from 'fs';

/**
 * ROBUST TABLE TESTING APPROACH
 *
 * Instead of verifying specific backend data values (which change frequently),
 * these functions test the functionality and structure of the table:
 *
 * - verifyTableHasData: Ensures table loads and displays data
 * - verifyTableColumnCount: Checks expected number of columns
 * - verifyColumnDataPattern: Validates data format/type without specific values
 * - verifyFilterApplied: Confirms filtering works by checking row count changes
 * - verifySortApplied: Confirms sorting works by checking order changes
 *
 * This approach makes tests more reliable and less dependent on backend data state.
 */

// Helper function to edit a cell
export async function editCell(table, rowIndex, columnIndex, value) {
  // Get all cells in the specified row
  const rowCells = table.locator(
    `.MuiDataGrid-row:nth-child(${rowIndex + 1}) .MuiDataGrid-cell`,
  );
  // Get the specific cell in the column
  const cell = rowCells.nth(columnIndex);
  await cell.dblclick();

  // Wait for the edit input to appear and fill it with test data
  const editInput = table.locator('input[type="text"]');
  await editInput.waitFor({ state: 'visible' });
  await editInput.fill(value);
  await editInput.press('Enter');

  // Verify the cell contains the entered data
  await expect(cell).toContainText(value);
}

// Helper function to setup table and verify its visibility
export async function setupTable(page, previewArea) {
  const sortableTableComponent = await dragAndVerifyComponent(
    page.getByTestId('draggable-component-table'),
    previewArea,
    'table',
  );

  const table = sortableTableComponent.locator('.MuiDataGrid-root');
  await expect(table).toBeVisible();
  return { sortableTableComponent, table };
}

// New robust verification functions that don't depend on specific data values

/**
 * Verify that the table has data loaded (not empty)
 */
export async function verifyTableHasData(page, table) {
  // Wait for table to load
  await expect(table.locator('.MuiDataGrid-overlay')).not.toBeVisible();

  // Wait for at least one cell to be visible
  await table
    .locator('.MuiDataGrid-cell')
    .first()
    .waitFor({ state: 'visible' });

  // Get all non-empty cells
  const cells = await table
    .locator('.MuiDataGrid-cell:not(.MuiDataGrid-cellEmpty)')
    .all();

  // Verify we have at least some data
  expect(cells.length).toBeGreaterThan(0);
}

/**
 * Verify that the table has the expected number of columns
 */
export async function verifyTableColumnCount(page, table, expectedColumnCount) {
  const columnHeaders = await table.locator('.MuiDataGrid-columnHeader').all();
  expect(columnHeaders.length).toBe(expectedColumnCount);
}

/**
 * Verify that a specific column contains data of a certain type/pattern
 */
export async function verifyColumnDataPattern(
  page,
  table,
  columnIndex,
  pattern,
) {
  const cells = await table
    .locator(`.MuiDataGrid-row .MuiDataGrid-cell:nth-child(${columnIndex + 1})`)
    .all();

  for (const cell of cells) {
    const cellText = await cell.textContent();
    if (cellText.trim() !== '') {
      expect(cellText).toMatch(pattern);
    }
  }
}

/**
 * Verify filtering in virtual scrolling tables by checking data changes
 * This is the most reliable method for tables with virtual scrolling
 */
export async function verifyFilterAppliedVirtual(
  page,
  table,
  filterFunction,
  options = {},
) {
  const {
    waitForUpdate = 2000,
    timeout = 10000,
    expectChange = true,
  } = options;

  // Get initial state
  const initialRows = await table.locator('.MuiDataGrid-row').all();
  const initialCount = initialRows.length;

  // Get initial first row content for comparison
  let initialFirstRowContent = '';
  if (initialRows.length > 0) {
    const firstRowCells = await initialRows[0]
      .locator('.MuiDataGrid-cell')
      .all();
    const cellTexts = await Promise.all(
      firstRowCells.map((cell) => cell.textContent()),
    );
    initialFirstRowContent = cellTexts.join('|');
  }

  // Apply filter
  await filterFunction();

  // Wait for table to update
  await page.waitForTimeout(waitForUpdate);

  // Wait for any loading overlay to disappear
  await expect(table.locator('.MuiDataGrid-overlay')).not.toBeVisible({
    timeout,
  });

  // Get new state
  const newRows = await table.locator('.MuiDataGrid-row').all();
  const newCount = newRows.length;

  // Get new first row content for comparison
  let newFirstRowContent = '';
  if (newRows.length > 0) {
    const firstRowCells = await newRows[0].locator('.MuiDataGrid-cell').all();
    const cellTexts = await Promise.all(
      firstRowCells.map((cell) => cell.textContent()),
    );
    newFirstRowContent = cellTexts.join('|');
  }

  if (expectChange) {
    // Verify that either the count changed OR the content changed
    const countChanged = newCount !== initialCount;
    const contentChanged = newFirstRowContent !== initialFirstRowContent;

    expect(countChanged || contentChanged).toBe(true);
  }

  return {
    initialCount,
    newCount,
    initialFirstRowContent,
    newFirstRowContent,
    countChanged: newCount !== initialCount,
    contentChanged: newFirstRowContent !== initialFirstRowContent,
  };
}

/**
 * Verify that sorting works by checking if the first row changes
 */
export async function verifySortApplied(page, table, expectedFirstValue) {
  await expect(table.locator('.MuiDataGrid-overlay')).not.toBeVisible();

  const firstCell = table
    .locator('.MuiDataGrid-row')
    .first()
    .locator('.MuiDataGrid-cell')
    .first();
  const firstCellText = await firstCell.textContent();
  expect(firstCellText).toBe(expectedFirstValue);
}

/**
 * Helper function to configure a table column
 * @param {import('@playwright/test').Page} page - The Playwright page object
 * @param {import('@playwright/test').Locator} table - The table locator
 * @param {number} columnIndex - The index of the column to configure
 * @param {Object} config - Configuration object
 * @param {string} config.label - The column label
 * @param {string} config.entity - The entity name
 * @param {string} config.property - The property name
 * @param {boolean} [config.useDataPicker=false] - Whether to use data picker
 */
export async function configureTableColumn(
  page,
  table,
  columnIndex,
  {
    label,
    entity,
    property,
    useDataPicker = false,
    mainEntity = false,
    relationship = null,
  },
  testInfo,
) {
  const columnHeader = table
    .locator('.MuiDataGrid-columnHeader')
    .nth(columnIndex);
  await columnHeader.hover();
  const menuButton = columnHeader.locator('.MuiDataGrid-menuIconButton');
  await menuButton.click();
  const editColumnMenuItem = page
    .locator('li[role="menuitem"]')
    .filter({ hasText: 'Edit Column' });
  await editColumnMenuItem.click();

  await expect(page.locator('.MuiModalDialog-root')).toBeVisible();

  if (useDataPicker) {
    await page.getByTestId('data-picker-switch').click();
    await expect(page.getByTestId('flow-start')).toBeVisible({
      timeout: 15000,
    });

    await setupFlowConnection(page, true);
    await selectFromAutocomplete(page, 'entity-autocomplete', entity);
    await selectFromAutocomplete(page, 'property-selector', property);
  } else {
    await selectFromAutocomplete(page, 'entity-select', entity, 0, {
      useSection: false,
    });

    // Wait for the property dropdown to become enabled after entity selection
    const propertySelect = page.getByTestId('property-select');
    await propertySelect.waitFor({ state: 'visible', timeout: 10000 });

    // Wait for the property dropdown to be enabled (not disabled)
    try {
      await page.waitForFunction(
        () => {
          const input = document.querySelector(
            '[data-testid="property-select"] input',
          );
          return input && !input.disabled;
        },
        { timeout: 15000 },
      );
    } catch (error) {
      // If property dropdown is still disabled, it might mean the entity has no properties
      // or there's an issue with the entity selection. Log this and continue.
      console.warn(
        'Property dropdown is still disabled after entity selection. This might indicate the entity has no available properties.',
      );
    }

    await selectFromAutocomplete(page, 'property-select', property, 0, {
      useSection: false,
    });
  }

  await page.getByTestId('column-label-input').locator('input').fill(label);
  if (mainEntity) {
    await page.getByTestId('main-entity-checkbox').click();
  } else if (relationship) {
    // Wait for the relationship dropdown to become enabled
    const relationshipSelect = page.getByTestId('relationship-select');
    await relationshipSelect.waitFor({ state: 'visible', timeout: 10000 });

    // Wait for the relationship dropdown to be enabled (not disabled)
    try {
      await page.waitForFunction(
        () => {
          const input = document.querySelector(
            '[data-testid="relationship-select"] input',
          );
          return input && !input.disabled;
        },
        { timeout: 15000 },
      );
    } catch (error) {
      // If relationship dropdown is still disabled, it might mean there are no relationships
      // or there's an issue with the entity selection. Log this and continue.
      console.warn(
        'Relationship dropdown is still disabled after entity selection. This might indicate there are no available relationships.',
      );
    }

    await selectFromAutocomplete(page, 'relationship-select', relationship, 0, {
      useSection: false,
    });
  }
  await page.getByTestId('save-button').click();

  // When using data picker, wait for the loading state to complete first
  if (useDataPicker) {
    // Wait for the save button to show loading state (becomes disabled)
    await expect(page.getByTestId('save-button')).toBeDisabled();

    // Wait for the modal to close instead of waiting for button to be enabled
    await expect(page.locator('.MuiModalDialog-root')).not.toBeVisible({
      timeout: 30000,
    });
  } else {
    // Wait for modal to close for non-data-picker cases
    await expect(page.locator('.MuiModalDialog-root')).not.toBeVisible({
      timeout: 10000,
    });
  }

  if (testInfo) {
    await page.waitForTimeout(10000);
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach('screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });
  }

  if (useDataPicker) {
    await expect(page.getByTestId('edit-modal')).not.toBeVisible({
      timeout: 30000,
    });
  }

  // Wait for table overlay to disappear with longer timeout
  await expect(table.locator('.MuiDataGrid-overlay')).not.toBeVisible({
    timeout: 15000,
  });
}

/**
 * Helper function to handle table downloads
 * @param {import('@playwright/test').Page} page - The Playwright page object
 * @param {string} downloadOption - The download option to select ('All columns' or 'Only visible columns')
 * @param {string} [downloadDir='./test-downloads'] - Directory to save the downloaded file
 * @returns {Promise<{suggestedFilename: string, fileSize: number}>} - Information about the downloaded file
 */
export async function handleTableDownload(
  page,
  downloadOption,
  downloadDir = './test-downloads',
) {
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-button').click();
  await page.getByTestId(`menu-item-${downloadOption}`).click();

  const download = await downloadPromise;
  const suggestedFilename = download.suggestedFilename();
  expect(suggestedFilename).toMatch(/\.xlsx$/);

  // Save the file to the specified location
  const savePath = `${downloadDir}/${suggestedFilename}`;
  await download.saveAs(savePath);

  // Clean up the temporary file and saved file
  await download.delete();
  await fs.promises.unlink(savePath);

  return { suggestedFilename };
}
