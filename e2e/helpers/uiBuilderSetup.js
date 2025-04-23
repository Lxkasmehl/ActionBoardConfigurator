import { test, expect } from '@playwright/test';
import { setupFlowConnection } from './flowSetup';

// Helper function to drag and verify a component
export async function dragAndVerifyComponent(
  component,
  previewArea,
  componentName,
) {
  await component.dragTo(previewArea);
  await expect(
    previewArea.getByTestId(`sortable-component-${componentName}`),
  ).toBeVisible();
  return previewArea.getByTestId(`sortable-component-${componentName}`);
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
