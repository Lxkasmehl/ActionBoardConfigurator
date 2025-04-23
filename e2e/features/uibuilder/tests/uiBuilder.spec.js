import { test, expect } from '@playwright/test';
import {
  selectFromAutocomplete,
  setupFilterCondition,
} from '../../../helpers/filterSetup';
import {
  dragAndVerifyComponent,
  editTextComponent,
  setupDynamicDataEditing,
  createAndVerifyGroup,
  setupComponentsInPreview,
  editGroup,
  verifyBorderColorsDifferent,
  setupAndCreateGroup,
} from '../../../helpers/uiBuilderSetup';

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
    const sortableHeadingComponent = await dragAndVerifyComponent(
      components.heading,
      previewArea,
      'heading',
    );

    const { frameLocator, sortableComponent } = await setupDynamicDataEditing(
      page,
      sortableHeadingComponent,
      8,
    );

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

    await sortableComponent
      .getByTestId('editable-text-component-save-button')
      .click({ timeout: 20000 });

    await expect(
      sortableComponent.getByText('New [[3.75]] Heading'),
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

  test('edit paragraph component with dynamic data', async ({ page }) => {
    const sortableParagraphComponent = await dragAndVerifyComponent(
      components.paragraph,
      previewArea,
      'paragraph',
    );

    const { frameLocator, sortableComponent } = await setupDynamicDataEditing(
      page,
      sortableParagraphComponent,
      9,
      true,
    );

    await selectFromAutocomplete(
      frameLocator,
      'entity-autocomplete',
      'Candidate',
    );
    await setupFilterCondition(frameLocator, 'candidateId', '=', '81');
    await selectFromAutocomplete(frameLocator, 'property-selector', 'address');

    await page.getByTestId('confirm-selection-button').click();

    await sortableComponent
      .getByTestId('editable-text-component-save-button')
      .click({ timeout: 20000 });

    await expect(
      sortableComponent.getByText(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est [[Landsberger Str. 110]] laborum.',
      ),
    ).toBeVisible();
  });

  test('create group with chart, filterArea, buttonBar, table', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const componentTypes = ['chart', 'filterArea', 'buttonBar', 'table'];
    const sortableComponents = await setupComponentsInPreview(
      page,
      previewArea,
      componentTypes,
    );

    await createAndVerifyGroup(
      page,
      Object.values(sortableComponents),
      'Test Group',
    );
  });

  test('create two groups with table and buttonBar', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const groupTypes = ['buttonBar', 'table'];
    const firstGroup = await setupAndCreateGroup(
      page,
      previewArea,
      groupTypes,
      'Test Group 1',
    );
    const secondGroup = await setupAndCreateGroup(
      page,
      previewArea,
      groupTypes,
      'Test Group 2',
    );

    expect(firstGroup.borderColor).not.toBe(secondGroup.borderColor);
  });

  test('create two groups with table and buttonBar and edit the two groups', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const groupTypes = ['buttonBar', 'table'];
    const firstGroup = await setupAndCreateGroup(
      page,
      previewArea,
      groupTypes,
      'Test Group 1',
    );
    const secondGroup = await setupAndCreateGroup(
      page,
      previewArea,
      groupTypes,
      'Test Group 2',
    );

    expect(firstGroup.borderColor).not.toBe(secondGroup.borderColor);

    // Edit groups
    await editGroup(page, 'Test Group 1', [0]);
    await editGroup(page, 'Test Group 2', [0, 1]);
    await editGroup(page, 'Test Group 1', [1]);

    // Verify border colors after editing
    await verifyBorderColorsDifferent(page, firstGroup, secondGroup);
  });
});
