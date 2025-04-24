import { test, expect } from '@playwright/test';
import { setupFlowConnection } from './flowSetup';
import { selectFromAutocomplete } from './filterSetup';

// Helper function to drag and verify a component
export async function dragAndVerifyComponent(
  component,
  previewArea,
  componentName,
) {
  // Count existing components before drag
  const existingComponents = await previewArea
    .getByTestId(`sortable-component-${componentName}`)
    .count();

  // Get the preview area's bounding box to calculate bottom position
  const previewBox = await previewArea.boundingBox();

  // Drag to the bottom of the preview area
  await component.dragTo(previewArea, {
    targetPosition: { x: previewBox.width / 2, y: previewBox.height - 10 },
  });

  // Wait for the new component (the last one in the list)
  const sortableComponent = previewArea
    .getByTestId(`sortable-component-${componentName}`)
    .nth(existingComponents);
  await expect(sortableComponent).toBeVisible();

  return sortableComponent;
}

// Helper function to edit text component
export async function editTextComponent(
  sortableComponent,
  newText,
  isTextarea = false,
) {
  await sortableComponent
    .getByTestId('editable-text-component-edit-button')
    .click();

  const inputField = sortableComponent
    .getByTestId('editable-text-component-input')
    .locator(isTextarea ? 'textarea:not([aria-hidden="true"])' : 'input');

  await inputField.clear();
  await inputField.fill(newText);

  await sortableComponent
    .getByTestId('editable-text-component-save-button')
    .click();
  await expect(sortableComponent.getByText(newText)).toBeVisible();
}

// Helper function to setup dynamic data editing
export async function setupDynamicDataEditing(
  page,
  sortableComponent,
  leftSteps,
  isTextarea = false,
) {
  await page.setViewportSize({ width: 1920, height: 1080 });
  test.setTimeout(45000);

  await sortableComponent
    .getByTestId('editable-text-component-edit-button')
    .click();

  const inputField = sortableComponent
    .getByTestId('editable-text-component-input')
    .locator(isTextarea ? 'textarea:not([aria-hidden="true"])' : 'input');

  await inputField.click();
  await inputField.press('Control+End');
  for (let i = 0; i < leftSteps; i++) {
    await inputField.press('ArrowLeft');
  }
  await inputField.type(' [[');

  const iFrame = page.getByTestId('data-picker-iframe');
  await expect(iFrame).toBeVisible();

  const frameLocator = page.frameLocator('[data-testid="data-picker-iframe"]');
  await setupFlowConnection(frameLocator, true);

  return { frameLocator, sortableComponent };
}

// Helper function to create and verify a group of components
export async function createAndVerifyGroup(page, components, groupName) {
  await page.getByTestId('create-edit-group-button').click();
  await page.getByTestId('create-new-group-button').click();

  // Wait for group creation dialog to be ready
  await page.getByTestId('group-name-input').waitFor({ state: 'visible' });

  // Click all components using force: true to bypass the enabled check
  for (const component of components) {
    await component.click({ force: true });
  }

  const groupNameInput = page.getByTestId('group-name-input').locator('input');
  await groupNameInput.fill(groupName);
  await page.getByTestId('save-new-group-button').click();

  // Verify all components have the same border color
  const firstComponentBorderColor = await components[0].evaluate((el) => {
    const style = window.getComputedStyle(el);
    return style.borderColor;
  });

  // Verify all other components have the same border color
  for (let i = 1; i < components.length; i++) {
    const currentBorderColor = await components[i].evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.borderColor;
    });
    expect(currentBorderColor).toBe(firstComponentBorderColor);
  }
}

// Helper function to create and verify a group with border color checking
export async function createAndVerifyGroupWithBorderCheck(
  page,
  components,
  groupName,
) {
  await createAndVerifyGroup(page, components, groupName);

  // Get border color of the group
  const groupBorderColor = await components[0].evaluate((el) => {
    const style = window.getComputedStyle(el);
    return style.borderColor;
  });

  return groupBorderColor;
}

// Helper function to setup multiple components in preview area
export async function setupComponentsInPreview(
  page,
  previewArea,
  componentTypes,
) {
  const components = {};
  for (const type of componentTypes) {
    const component = page.getByTestId(`draggable-component-${type}`);
    components[type] = await dragAndVerifyComponent(
      component,
      previewArea,
      type,
    );
  }
  return components;
}

export async function editGroup(page, groupName, buttonBarIndices) {
  await page.getByTestId('create-edit-group-button').click();
  await page.getByTestId('edit-existing-group-button').click();

  await selectFromAutocomplete(page, 'group-selector', groupName, 0, {
    useSection: false,
  });

  for (const index of buttonBarIndices) {
    await page.getByTestId('sortable-component-buttonBar').nth(index).click({
      force: true,
    });
  }

  await page.getByTestId('save-edited-group-button').click();
}

// Helper function to get border color of an element
export async function getBorderColor(element) {
  return element.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return style.borderColor;
  });
}

// Helper function to setup and create a group
export async function setupAndCreateGroup(
  page,
  previewArea,
  groupTypes,
  groupName,
) {
  const components = await setupComponentsInPreview(
    page,
    previewArea,
    groupTypes,
  );
  const borderColor = await createAndVerifyGroupWithBorderCheck(
    page,
    Object.values(components),
    groupName,
  );
  return { components, borderColor };
}

// Helper function to verify border colors are different
export async function verifyBorderColorsDifferent(page) {
  const firstButtonBarColor = await getBorderColor(
    page.getByTestId('sortable-component-buttonBar').first(),
  );
  const secondButtonBarColor = await getBorderColor(
    page.getByTestId('sortable-component-buttonBar').last(),
  );
  const firstTableColor = await getBorderColor(
    page.getByTestId('sortable-component-table').first(),
  );
  const secondTableColor = await getBorderColor(
    page.getByTestId('sortable-component-table').last(),
  );

  expect(firstButtonBarColor).not.toBe(secondButtonBarColor);
  expect(firstTableColor).not.toBe(secondTableColor);
  expect(firstButtonBarColor).toBe(secondTableColor);
  expect(secondButtonBarColor).toBe(firstTableColor);
}

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
