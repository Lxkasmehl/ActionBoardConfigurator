import { test, expect } from '@playwright/test';

test.describe('UIBuilder Tests', () => {
  let components;
  let previewArea;

  test.beforeEach(async ({ page }) => {
    // Navigate to the UIBuilder page
    await page.goto('http://localhost:5173/ui-builder');

    // Define all components
    components = {
      heading: page.getByTestId('draggable-component-heading'),
      paragraph: page.getByTestId('draggable-component-paragraph'),
      filterArea: page.getByTestId('draggable-component-filterArea'),
      buttonBar: page.getByTestId('draggable-component-buttonBar'),
      table: page.getByTestId('draggable-component-table'),
      chart: page.getByTestId('draggable-component-chart'),
    };

    // Get preview area
    previewArea = page.getByTestId('preview-area');
    await expect(previewArea).toBeVisible();

    // Verify all components are visible
    for (const component of Object.values(components)) {
      await expect(component).toBeVisible();
    }
  });

  test('dnd all components in preview area', async () => {
    // Drag all components to preview area
    for (const [componentName, component] of Object.entries(components)) {
      await component.dragTo(previewArea);
      await expect(
        previewArea.getByTestId(`sortable-component-${componentName}`),
      ).toBeVisible();
    }
  });

  test('delete component from preview area with trash bin', async ({
    page,
  }) => {
    const trashBin = page.getByTestId('trash-bin');
    await expect(trashBin).toBeHidden();

    // Drag heading component to preview
    await components.heading.dragTo(previewArea);
    const sortableComponent = previewArea.getByTestId(
      'sortable-component-heading',
    );
    await expect(sortableComponent).toBeVisible();

    // Start dragging the component
    await sortableComponent.hover();
    await page.mouse.down();
    await expect(trashBin).toBeVisible();

    // Complete the drag to trash bin
    const trashBinBox = await trashBin.boundingBox();
    await page.mouse.move(
      trashBinBox.x + trashBinBox.width / 2,
      trashBinBox.y + trashBinBox.height / 2,
    );
    await page.mouse.up();
    await expect(trashBin).toBeHidden();
    await expect(sortableComponent).toBeHidden();
  });

  test('edit heading component without dynamic data', async () => {
    await components.heading.dragTo(previewArea);
    const sortableHeadingComponent = previewArea.getByTestId(
      'sortable-component-heading',
    );
    await expect(sortableHeadingComponent).toBeVisible();

    // Click edit button
    await sortableHeadingComponent
      .getByTestId('editable-text-component-edit-button')
      .click();

    // Get the input field and edit the text
    const inputField = sortableHeadingComponent
      .getByTestId('editable-text-component-input')
      .locator('input');
    await inputField.clear();
    await inputField.fill('Test Heading');

    // Click save button
    await sortableHeadingComponent
      .getByTestId('editable-text-component-save-button')
      .click();

    // Verify the new text is displayed
    await expect(
      sortableHeadingComponent.getByText('Test Heading'),
    ).toBeVisible();
  });
});
