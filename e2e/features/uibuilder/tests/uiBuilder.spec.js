import { test, expect } from '@playwright/test';

test.describe('UIBuilder Drag and Drop Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the UIBuilder page
    await page.goto('http://localhost:5173/ui-builder');
  });

  test('dnd all components in preview area', async ({ page }) => {
    const headingComponent = page.getByTestId('draggable-component-heading');
    await expect(headingComponent).toBeVisible();
    const paragraphComponent = page.getByTestId(
      'draggable-component-paragraph',
    );
    await expect(paragraphComponent).toBeVisible();
    const filterAreaComponent = page.getByTestId(
      'draggable-component-filterArea',
    );
    await expect(filterAreaComponent).toBeVisible();
    const buttonBarComponent = page.getByTestId(
      'draggable-component-buttonBar',
    );
    await expect(buttonBarComponent).toBeVisible();
    const tableComponent = page.getByTestId('draggable-component-table');
    await expect(tableComponent).toBeVisible();
    const chartComponent = page.getByTestId('draggable-component-chart');
    await expect(chartComponent).toBeVisible();

    const dropZone = page.getByTestId('preview-area');
    await expect(dropZone).toBeVisible();

    await headingComponent.dragTo(dropZone);
    await paragraphComponent.dragTo(dropZone);
    await filterAreaComponent.dragTo(dropZone);
    await buttonBarComponent.dragTo(dropZone);
    await tableComponent.dragTo(dropZone);
    await chartComponent.dragTo(dropZone);

    await expect(
      dropZone.getByTestId('sortable-component-heading'),
    ).toBeVisible();
    await expect(
      dropZone.getByTestId('sortable-component-paragraph'),
    ).toBeVisible();
    await expect(
      dropZone.getByTestId('sortable-component-filterArea'),
    ).toBeVisible();
    await expect(
      dropZone.getByTestId('sortable-component-buttonBar'),
    ).toBeVisible();
    await expect(
      dropZone.getByTestId('sortable-component-table'),
    ).toBeVisible();
    await expect(
      dropZone.getByTestId('sortable-component-chart'),
    ).toBeVisible();
  });

  test('delete component from preview area with trash bin', async ({
    page,
  }) => {
    const headingComponent = page.getByTestId('draggable-component-heading');
    await expect(headingComponent).toBeVisible();

    const previewArea = page.getByTestId('preview-area');
    await expect(previewArea).toBeVisible();

    const trashBin = page.getByTestId('trash-bin');
    await expect(trashBin).toBeHidden();

    await headingComponent.dragTo(previewArea);

    await expect(
      previewArea.getByTestId('sortable-component-heading'),
    ).toBeVisible();

    const sortableComponent = previewArea.getByTestId(
      'sortable-component-heading',
    );

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

    await expect(
      previewArea.getByTestId('sortable-component-heading'),
    ).toBeHidden();
  });

  test('edit heading component without dynamic data', async ({ page }) => {
    const headingComponent = page.getByTestId('draggable-component-heading');
    await expect(headingComponent).toBeVisible();

    const previewArea = page.getByTestId('preview-area');
    await expect(previewArea).toBeVisible();

    await headingComponent.dragTo(previewArea);

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
