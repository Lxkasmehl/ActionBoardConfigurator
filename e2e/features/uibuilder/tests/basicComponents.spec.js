import { test, expect } from '@playwright/test';
import {
  dragAndVerifyComponent,
  editTextComponent,
} from '../helpers/componentHelpers';

test.describe('Basic Component Tests', () => {
  let components;
  let previewArea;

  test.beforeEach(async ({ page }) => {
    // Navigate to the UIBuilder page
    await page.goto('http://localhost:5173/#/ui-builder');

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

  test('dnd all components in preview area', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    // Drag all components to preview area
    for (const [componentName, component] of Object.entries(components)) {
      await dragAndVerifyComponent(component, previewArea, componentName);
    }
  });

  test('delete component from preview area with trash bin', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'Skipping test for WebKit browser');
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
    await expect(sortableComponent).toBeHidden({ timeout: 30000 });
  });

  test('edit heading component without dynamic data', async () => {
    const sortableHeadingComponent = await dragAndVerifyComponent(
      components.heading,
      previewArea,
      'heading',
    );
    await editTextComponent(sortableHeadingComponent, 'Test Heading');
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
