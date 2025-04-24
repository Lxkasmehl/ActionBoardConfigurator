import { expect } from '@playwright/test';
import { dragAndVerifyComponent } from './componentHelpers';

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

// Helper function to verify table data
export async function verifyTableData(
  table,
  expectedValues,
  numberOfCells = 13,
) {
  const cells = await table
    .locator('.MuiDataGrid-cell:not(.MuiDataGrid-cellEmpty)')
    .all();

  for (let i = 0; i < numberOfCells; i++) {
    const cellText = await cells[i].textContent();
    expect(cellText).toBe(expectedValues[i]);
  }
}
