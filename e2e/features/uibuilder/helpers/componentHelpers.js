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
  if (!previewBox) {
    throw new Error('Could not get preview area bounding box');
  }

  // Ensure component is visible and enabled
  await expect(component).toBeVisible();
  await expect(component).toBeEnabled();

  // Add a small delay before dragging to ensure component is ready
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Get component's initial position
  const componentBox = await component.boundingBox();
  if (!componentBox) {
    throw new Error('Could not get component bounding box');
  }

  // Calculate target position (slightly above the bottom)
  const targetX = previewBox.width / 2;
  const targetY = previewBox.height - 20;

  // Get the page object from the component
  const page = component.page();

  // Drag to the bottom of the preview area with enhanced retry mechanism
  let retryCount = 0;
  const maxRetries = 5;
  let success = false;

  while (retryCount < maxRetries && !success) {
    try {
      // Move to the component first
      await page.mouse.move(
        componentBox.x + componentBox.width / 2,
        componentBox.y + componentBox.height / 2,
      );
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Press the mouse button
      await page.mouse.down();
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Move to the target position in steps
      const steps = 10;
      for (let i = 1; i <= steps; i++) {
        const currentX =
          componentBox.x + (targetX - componentBox.x) * (i / steps);
        const currentY =
          componentBox.y + (targetY - componentBox.y) * (i / steps);
        await page.mouse.move(currentX, currentY);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Release the mouse button
      await page.mouse.up();
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify the drag was successful
      const sortableComponent = previewArea
        .getByTestId(`sortable-component-${componentName}`)
        .nth(existingComponents);

      await expect(sortableComponent).toBeVisible({ timeout: 15000 });
      await expect(sortableComponent).toBeEnabled();

      success = true;
    } catch (error) {
      retryCount++;
      if (retryCount === maxRetries) {
        throw new Error(
          `Failed to drag component after ${maxRetries} attempts: ${error.message}`,
        );
      }
      // Wait longer before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Return the newly created component
  return previewArea
    .getByTestId(`sortable-component-${componentName}`)
    .nth(existingComponents);
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
