import { test, expect } from '@playwright/test';
import { dragAndVerifyComponent } from '../features/uibuilder/helpers/componentHelpers';
import { setupDynamicDataEditing } from '../features/uibuilder/helpers/uiHelpers';
import { setupTestData } from './helpers/testSetup';
import {
  getSectionState,
  getEdgeConnections,
  getFilterContent,
  getResults,
} from './helpers/stateHelpers';

test.describe('Local Storage Tests', () => {
  test.beforeEach(async () => {
    test.setTimeout(90000);
  });

  test('should persist entity sections, filters, and connections after page reload in DataPicker', async ({
    page,
  }) => {
    await setupTestData(page);

    // Get initial state
    const sectionsBeforeReload = await page.getByTestId('entity-section').all();
    const [firstSectionText, secondSectionText] =
      await getSectionState(sectionsBeforeReload);
    const edgeConnectionsBeforeReload = await getEdgeConnections(page);
    const filterContentBeforeReload = await getFilterContent(
      page,
      sectionsBeforeReload,
    );
    const resultBeforeReload = await getResults(page);

    // Reload page
    await page.reload();
    await expect(page.getByTestId('entity-section').first()).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByTestId('flow-start')).toBeVisible({
      timeout: 10000,
    });

    // Verify state after reload
    const sectionsAfterReload = await page.getByTestId('entity-section').all();
    const [firstSectionTextAfter, secondSectionTextAfter] =
      await getSectionState(sectionsAfterReload);
    const edgeConnectionsAfterReload = await getEdgeConnections(page);
    const filterContentAfterReload = await getFilterContent(
      page,
      sectionsAfterReload,
    );
    const resultAfterReload = await getResults(page);

    // Assertions
    expect(firstSectionText).toBe(firstSectionTextAfter);
    expect(secondSectionText).toBe(secondSectionTextAfter);
    expect(edgeConnectionsAfterReload).toEqual(edgeConnectionsBeforeReload);
    expect(filterContentAfterReload).toEqual(filterContentBeforeReload);
    expect(resultBeforeReload).toBe(resultAfterReload);
  });

  test('should persist entity sections, filters, and connections when switching to UIBuilder', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'Skipping test for WebKit');

    await setupTestData(page);

    // Get initial state
    const sectionsBeforeReload = await page.getByTestId('entity-section').all();
    const [firstSectionText, secondSectionText] =
      await getSectionState(sectionsBeforeReload);
    const edgeConnectionsBeforeReload = await getEdgeConnections(page);
    const filterContentBeforeReload = await getFilterContent(
      page,
      sectionsBeforeReload,
    );
    const resultBeforeReload = await getResults(page);

    // Switch to UIBuilder
    await page.goto('http://localhost:5173/ui-builder');
    const previewArea = page.getByTestId('preview-area');
    await expect(previewArea).toBeVisible();

    // Setup UI Builder components
    const sortableParagraphComponent = await dragAndVerifyComponent(
      page.getByTestId('draggable-component-paragraph'),
      previewArea,
      'paragraph',
    );

    const { frameLocator } = await setupDynamicDataEditing(
      page,
      sortableParagraphComponent,
      0,
      true,
      true,
    );

    // Wait for sections to load
    await expect(frameLocator.getByTestId('entity-section').nth(0)).toBeVisible(
      { timeout: 20000 },
    );
    await expect(frameLocator.getByTestId('entity-section').nth(1)).toBeVisible(
      { timeout: 20000 },
    );

    // Verify state in UIBuilder
    const sectionsAfterReload = await frameLocator
      .getByTestId('entity-section')
      .all();
    const [firstSectionTextAfter, secondSectionTextAfter] =
      await getSectionState(sectionsAfterReload);
    const edgeConnectionsAfterReload = await getEdgeConnections(frameLocator);
    const filterContentAfterReload = await getFilterContent(
      frameLocator,
      sectionsAfterReload,
    );
    const resultAfterReload = await getResults(frameLocator);

    // Assertions
    expect(firstSectionText).toBe(firstSectionTextAfter);
    expect(secondSectionText).toBe(secondSectionTextAfter);
    expect(edgeConnectionsAfterReload).toEqual(edgeConnectionsBeforeReload);
    expect(filterContentAfterReload).toEqual(filterContentBeforeReload);
    expect(resultBeforeReload).toBe(resultAfterReload);
  });

  test('should persist entity sections, filters, and connections after page reload in UIBuilder', async ({
    page,
  }) => {
    await page.goto('http://localhost:5173/ui-builder');
    const previewArea = page.getByTestId('preview-area');
    await expect(previewArea).toBeVisible();

    // Setup UI Builder components
    const sortableParagraphComponent = await dragAndVerifyComponent(
      page.getByTestId('draggable-component-paragraph'),
      previewArea,
      'paragraph',
    );

    const { frameLocator } = await setupDynamicDataEditing(
      page,
      sortableParagraphComponent,
      0,
      true,
      true,
    );

    await expect(frameLocator.getByTestId('entity-section')).toBeVisible({
      timeout: 20000,
    });

    await setupTestData(frameLocator, true);

    // Get initial state
    const sectionsBeforeReload = await frameLocator
      .getByTestId('entity-section')
      .all();
    const [firstSectionText, secondSectionText] =
      await getSectionState(sectionsBeforeReload);
    const edgeConnectionsBeforeReload = await getEdgeConnections(frameLocator);
    const filterContentBeforeReload = await getFilterContent(
      frameLocator,
      sectionsBeforeReload,
    );
    const resultBeforeReload = await getResults(frameLocator);

    await page.reload();
    const previewAreaAfterReload = page.getByTestId('preview-area');
    await expect(previewAreaAfterReload).toBeVisible();

    // Setup UI Builder components
    const sortableParagraphComponentAfterReload = await dragAndVerifyComponent(
      page.getByTestId('draggable-component-paragraph'),
      previewAreaAfterReload,
      'paragraph',
    );

    const { frameLocator: frameLocatorAfterReload } =
      await setupDynamicDataEditing(
        page,
        sortableParagraphComponentAfterReload,
        0,
        true,
        true,
      );

    // Wait for sections to load
    await expect(
      frameLocatorAfterReload.getByTestId('entity-section').nth(0),
    ).toBeVisible({ timeout: 20000 });
    await expect(
      frameLocatorAfterReload.getByTestId('entity-section').nth(1),
    ).toBeVisible({ timeout: 20000 });

    // Verify state in UIBuilder
    const sectionsAfterReload = await frameLocatorAfterReload
      .getByTestId('entity-section')
      .all();
    const [firstSectionTextAfter, secondSectionTextAfter] =
      await getSectionState(sectionsAfterReload);
    const edgeConnectionsAfterReload = await getEdgeConnections(
      frameLocatorAfterReload,
    );
    const filterContentAfterReload = await getFilterContent(
      frameLocatorAfterReload,
      sectionsAfterReload,
    );
    const resultAfterReload = await getResults(frameLocatorAfterReload);

    // Assertions
    expect(firstSectionText).toBe(firstSectionTextAfter);
    expect(secondSectionText).toBe(secondSectionTextAfter);
    expect(edgeConnectionsAfterReload).toEqual(edgeConnectionsBeforeReload);
    expect(filterContentAfterReload).toEqual(filterContentBeforeReload);
    expect(resultBeforeReload).toBe(resultAfterReload);
  });
});
