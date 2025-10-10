import { test, expect } from '@playwright/test';
import { dragAndVerifyComponent } from '../helpers/componentHelpers';
import { setupDynamicDataEditing } from '../helpers/uiHelpers';
import { setupFilterCondition } from '../../datapicker/helpers/filterSetup';
import { selectFromAutocomplete } from '../../../../shared/helpers/autocompleteHelper';

test.describe('Dynamic Data Tests', () => {
  let components;
  let previewArea;

  test.beforeEach(async ({ page }) => {
    // Navigate to the UIBuilder page
    await page.goto('https://localhost:5173/#/ui-builder');

    // Define components needed for dynamic data tests
    components = {
      heading: page.getByTestId('draggable-component-heading'),
      paragraph: page.getByTestId('draggable-component-paragraph'),
    };

    // Get preview area
    previewArea = page.getByTestId('preview-area');
    await expect(previewArea).toBeVisible();
  });

  test('edit heading component with dynamic data', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'This test is skipped for Webkit');
    const sortableHeadingComponent = await dragAndVerifyComponent(
      components.heading,
      previewArea,
      'heading',
    );

    const { sortableComponent } = await setupDynamicDataEditing(
      page,
      sortableHeadingComponent,
      8,
    );

    await selectFromAutocomplete(
      page,
      'entity-autocomplete',
      'InterviewOverallAssessment',
    );
    await setupFilterCondition(page, 'interviewOverallAssessmentId', '=', '21');
    await selectFromAutocomplete(page, 'property-selector', 'averageRating');

    await page.getByTestId('confirm-selection-button').click();

    await sortableComponent
      .getByTestId('editable-text-component-save-button')
      .click({ timeout: 20000 });

    await expect(
      sortableComponent.getByText('New [[3.75]] Heading'),
    ).toBeVisible();
  });

  test('edit paragraph component with dynamic data', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'This test is skipped for Webkit');
    const sortableParagraphComponent = await dragAndVerifyComponent(
      components.paragraph,
      previewArea,
      'paragraph',
    );

    const { sortableComponent } = await setupDynamicDataEditing(
      page,
      sortableParagraphComponent,
      9,
      true,
    );

    await selectFromAutocomplete(page, 'entity-autocomplete', 'Candidate');
    await setupFilterCondition(page, 'candidateId', '=', '81');
    await selectFromAutocomplete(page, 'property-selector', 'address');

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
});
