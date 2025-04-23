import { test, expect } from '@playwright/test';
import {
  setupComponentsInPreview,
  createAndVerifyGroup,
  setupAndCreateGroup,
  editGroup,
  verifyBorderColorsDifferent,
} from '../../../helpers/uiBuilderSetup';

test.describe('Group Tests', () => {
  let previewArea;

  test.beforeEach(async ({ page }) => {
    // Navigate to the UIBuilder page
    await page.goto('http://localhost:5173/ui-builder');

    // Get preview area
    previewArea = page.getByTestId('preview-area');
    await expect(previewArea).toBeVisible();
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
