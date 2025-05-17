import { test, expect } from '@playwright/test';
import { setupFlowConnection } from '../features/datapicker/helpers/flowSetup';
import { setupFilterCondition } from '../features/datapicker/helpers/filterSetup';
import { selectFromAutocomplete } from '../helpers/autocompleteHelper';
import { dragAndVerifyComponent } from '../features/uibuilder/helpers/componentHelpers';
import { setupDynamicDataEditing } from '../features/uibuilder/helpers/uiHelpers';

test.describe('Local Storage Tests', () => {
  test('set up two entity sections with filters and connection and check persistence only in DataPicker', async ({
    page,
  }) => {
    test.setTimeout(60000);
    await setupFlowConnection(page);
    await page.locator('button svg[data-testid="AddIcon"]').click();

    const sections = page.getByTestId('entity-section');
    await sections.first().locator('div[class*="source"]').click();
    await sections.last().locator('div[class*="target"]').click();

    await selectFromAutocomplete(
      page,
      'entity-autocomplete',
      'FOBusinessUnit',
      0,
    );
    await setupFilterCondition(page, 'externalCode', '=', 'BU_003', 0);
    await selectFromAutocomplete(
      page,
      'property-selector',
      'createdDateTime',
      0,
    );

    await selectFromAutocomplete(page, 'entity-autocomplete', 'Candidate', 1);
    await setupFilterCondition(
      page,
      'lastModifiedDateTime',
      '<',
      null,
      1,
      true,
    );
    await selectFromAutocomplete(page, 'property-selector', 'lastName', 1);

    // Store the current state for comparison
    const sectionsBeforeReload = await page.getByTestId('entity-section').all();
    const firstSectionText = await sectionsBeforeReload[0].textContent();
    const secondSectionText = await sectionsBeforeReload[1].textContent();

    // Store edge information before reload
    const edgesBeforeReload = await page
      .locator('[data-testid^="rf__edge-"]')
      .all();
    const edgeConnectionsBeforeReload = await Promise.all(
      edgesBeforeReload.map(async (edge) => {
        const sourceId = await edge.getAttribute('data-source');
        const targetId = await edge.getAttribute('data-target');
        return { sourceId, targetId };
      }),
    );

    // Store filter modal content before reload
    const filterContentBeforeReload = [];
    for (let i = 0; i < 2; i++) {
      await sectionsBeforeReload[i].getByTestId('add-filter-button').click();
      const modal = page.getByTestId('filter-modal');
      await expect(modal).toBeVisible();
      filterContentBeforeReload.push(await modal.textContent());
      await page.getByTestId('filter-modal-save-button').click();
      await expect(modal).not.toBeVisible();
    }

    await page.getByTestId('send-request-button').click();
    await page.getByTestId('KeyboardArrowRightIcon').click();
    const resultBeforeReload = await page
      .getByTestId('results-modal')
      .first()
      .textContent();

    // Reload the page
    await page.reload();
    await expect(page.getByTestId('entity-section').first()).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByTestId('flow-start')).toBeVisible({
      timeout: 10000,
    });

    // Verify the state after reload
    const sectionsAfterReload = await page.getByTestId('entity-section').all();
    const firstSectionTextAfter = await sectionsAfterReload[0].textContent();
    const secondSectionTextAfter = await sectionsAfterReload[1].textContent();

    // Compare the states
    expect(firstSectionText).toBe(firstSectionTextAfter);
    expect(secondSectionText).toBe(secondSectionTextAfter);

    // Verify edges after reload
    const edgesAfterReload = await page
      .locator('[data-testid^="rf__edge-"]')
      .all();
    const edgeConnectionsAfterReload = await Promise.all(
      edgesAfterReload.map(async (edge) => {
        const sourceId = await edge.getAttribute('data-source');
        const targetId = await edge.getAttribute('data-target');
        return { sourceId, targetId };
      }),
    );

    // Compare edge connections
    expect(edgeConnectionsAfterReload).toEqual(edgeConnectionsBeforeReload);

    // Verify filter modal content after reload
    const filterContentAfterReload = [];
    for (let i = 0; i < 2; i++) {
      await sectionsAfterReload[i].getByTestId('add-filter-button').click();
      const modal = page.getByTestId('filter-modal');
      await expect(modal).toBeVisible();
      filterContentAfterReload.push(await modal.textContent());
      await page.getByTestId('filter-modal-save-button').click();
      await expect(modal).not.toBeVisible();
    }

    // Compare filter content
    expect(filterContentAfterReload).toEqual(filterContentBeforeReload);

    await page.getByTestId('send-request-button').click();
    await page.getByTestId('KeyboardArrowRightIcon').click();
    const resultAfterReload = await page
      .getByTestId('results-modal')
      .first()
      .textContent();

    expect(resultBeforeReload).toBe(resultAfterReload);
  });

  test('set up two entity sections with filters and connection in DataPicker and check persistence while switching to UIBuilder', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'Skipping test for WebKit');
    test.setTimeout(60000);
    await setupFlowConnection(page);
    await page.locator('button svg[data-testid="AddIcon"]').click();

    const sections = page.getByTestId('entity-section');
    await sections.first().locator('div[class*="source"]').click();
    await sections.last().locator('div[class*="target"]').click();

    await selectFromAutocomplete(
      page,
      'entity-autocomplete',
      'FOBusinessUnit',
      0,
    );
    await setupFilterCondition(page, 'externalCode', '=', 'BU_003', 0);
    await selectFromAutocomplete(
      page,
      'property-selector',
      'createdDateTime',
      0,
    );

    await selectFromAutocomplete(page, 'entity-autocomplete', 'Candidate', 1);
    await setupFilterCondition(
      page,
      'lastModifiedDateTime',
      '<',
      null,
      1,
      true,
    );
    await selectFromAutocomplete(page, 'property-selector', 'lastName', 1);

    // Store the current state for comparison
    const sectionsBeforeReload = await page.getByTestId('entity-section').all();
    const firstSectionText = await sectionsBeforeReload[0].textContent();
    const secondSectionText = await sectionsBeforeReload[1].textContent();

    // Store edge information before reload
    const edgesBeforeReload = await page
      .locator('[data-testid^="rf__edge-"]')
      .all();
    const edgeConnectionsBeforeReload = await Promise.all(
      edgesBeforeReload.map(async (edge) => {
        const sourceId = await edge.getAttribute('data-source');
        const targetId = await edge.getAttribute('data-target');
        return { sourceId, targetId };
      }),
    );

    // Store filter modal content before reload
    const filterContentBeforeReload = [];
    for (let i = 0; i < 2; i++) {
      await sectionsBeforeReload[i].getByTestId('add-filter-button').click();
      const modal = page.getByTestId('filter-modal');
      await expect(modal).toBeVisible();
      filterContentBeforeReload.push(await modal.textContent());
      await page.getByTestId('filter-modal-save-button').click();
      await expect(modal).not.toBeVisible();
    }

    await page.getByTestId('send-request-button').click();
    await page.getByTestId('KeyboardArrowRightIcon').click();
    const resultBeforeReload = await page
      .getByTestId('results-modal')
      .first()
      .textContent();

    await page.goto('http://localhost:5173/ui-builder');

    const previewArea = page.getByTestId('preview-area');
    await expect(previewArea).toBeVisible();

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

    // Wait for sections to be fully loaded
    await expect(frameLocator.getByTestId('entity-section').nth(0)).toBeVisible(
      { timeout: 20000 },
    );
    await expect(frameLocator.getByTestId('entity-section').nth(1)).toBeVisible(
      { timeout: 20000 },
    );

    const sectionsAfterReload = await frameLocator
      .getByTestId('entity-section')
      .all();

    const firstSectionTextAfter = await sectionsAfterReload[0].textContent();
    const secondSectionTextAfter = await sectionsAfterReload[1].textContent();

    // Compare the states
    expect(firstSectionText).toBe(firstSectionTextAfter);
    expect(secondSectionText).toBe(secondSectionTextAfter);

    // Verify edges after reload
    const edgesAfterReload = await frameLocator
      .locator('[data-testid^="rf__edge-"]')
      .all();
    const edgeConnectionsAfterReload = await Promise.all(
      edgesAfterReload.map(async (edge) => {
        const sourceId = await edge.getAttribute('data-source');
        const targetId = await edge.getAttribute('data-target');
        return { sourceId, targetId };
      }),
    );

    // Compare edge connections
    expect(edgeConnectionsAfterReload).toEqual(edgeConnectionsBeforeReload);

    // Verify filter modal content after reload
    const filterContentAfterReload = [];
    for (let i = 0; i < 2; i++) {
      await sectionsAfterReload[i].getByTestId('add-filter-button').click();
      const modal = frameLocator.getByTestId('filter-modal');
      await expect(modal).toBeVisible();
      filterContentAfterReload.push(await modal.textContent());
      await frameLocator.getByTestId('filter-modal-save-button').click();
      await expect(modal).not.toBeVisible();
    }

    // Compare filter content
    expect(filterContentAfterReload).toEqual(filterContentBeforeReload);

    await frameLocator.getByTestId('send-request-button').click();
    await frameLocator.getByTestId('KeyboardArrowRightIcon').click();
    const resultAfterReload = await frameLocator
      .getByTestId('results-modal')
      .first()
      .textContent();

    expect(resultBeforeReload).toBe(resultAfterReload);
  });
});
