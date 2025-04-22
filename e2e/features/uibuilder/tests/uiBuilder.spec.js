import { test, expect } from '@playwright/test';
import {
  selectFromAutocomplete,
  setupFilterCondition,
} from '../../../helpers/filterSetup';
import { setupFlowConnection } from '../../../helpers/flowSetup';

// Helper function to drag and verify a component
async function dragAndVerifyComponent(component, previewArea, componentName) {
  await component.dragTo(previewArea);
  await expect(
    previewArea.getByTestId(`sortable-component-${componentName}`),
  ).toBeVisible();
  return previewArea.getByTestId(`sortable-component-${componentName}`);
}

// Helper function to edit text component
async function editTextComponent(
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
      await dragAndVerifyComponent(component, previewArea, componentName);
    }
  });

  test('delete component from preview area with trash bin', async ({
    page,
  }) => {
    const trashBin = page.getByTestId('trash-bin');
    await expect(trashBin).toBeHidden();

    // Drag heading component to preview
    const sortableComponent = await dragAndVerifyComponent(
      components.heading,
      previewArea,
      'heading',
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
    await expect(sortableComponent).toBeHidden();
  });

  test('edit heading component without dynamic data', async () => {
    const sortableHeadingComponent = await dragAndVerifyComponent(
      components.heading,
      previewArea,
      'heading',
    );
    await editTextComponent(sortableHeadingComponent, 'Test Heading');
  });

  test('edit heading component with dynamic data', async ({ page }) => {
    // Set viewport to a larger size
    await page.setViewportSize({ width: 1920, height: 1080 });
    test.setTimeout(45000);

    const sortableHeadingComponent = await dragAndVerifyComponent(
      components.heading,
      previewArea,
      'heading',
    );
    await sortableHeadingComponent
      .getByTestId('editable-text-component-edit-button')
      .click();

    const inputField = sortableHeadingComponent
      .getByTestId('editable-text-component-input')
      .locator('input');

    // Position cursor before "Heading" and type square brackets
    await inputField.click();
    for (let i = 0; i < 8; i++) {
      await inputField.press('ArrowLeft');
    }
    await inputField.type(' [[');

    const iFrame = page.getByTestId('data-picker-iframe');
    await expect(iFrame).toBeVisible();

    // Wait for the iframe to load and its content to be ready
    const frameLocator = page.frameLocator(
      '[data-testid="data-picker-iframe"]',
    );

    await setupFlowConnection(frameLocator, true);

    await selectFromAutocomplete(
      frameLocator,
      'entity-autocomplete',
      'InterviewOverallAssessment',
    );
    await setupFilterCondition(
      frameLocator,
      'interviewOverallAssessmentId',
      '=',
      '21',
    );
    await selectFromAutocomplete(
      frameLocator,
      'property-selector',
      'averageRating',
    );

    await page.getByTestId('confirm-selection-button').click();

    await sortableHeadingComponent
      .getByTestId('editable-text-component-save-button')
      .click({ timeout: 20000 });

    await expect(
      sortableHeadingComponent.getByText('New [[3.75]] Heading'),
    ).toBeVisible();
  });

  test('edit paragraph component without dynamic data', async () => {
    const sortableParagraphComponent = await dragAndVerifyComponent(
      components.paragraph,
      previewArea,
      'paragraph',
    );
    const paragraphText =
      "Airedale babybel gouda. Cut the cheese goat who moved my cheese when the cheese comes out everybody's happy boursin fromage red leicester macaroni cheese. Fromage croque monsieur boursin mascarpone brie swiss cow mozzarella. Feta cheese and wine everyone loves say cheese red leicester bavarian bergkase chalk and cheese smelly cheese. Fromage frais brie goat taleggio who moved my cheese emmental manchego cheese and wine. Brie cauliflower cheese mozzarella caerphilly cheese and wine manchego danish fontina cheesy feet. Fondue edam port-salut roquefort babybel.";
    await editTextComponent(sortableParagraphComponent, paragraphText, true);
  });
});
