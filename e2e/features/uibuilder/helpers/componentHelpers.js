import { expect } from '@playwright/test';

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
