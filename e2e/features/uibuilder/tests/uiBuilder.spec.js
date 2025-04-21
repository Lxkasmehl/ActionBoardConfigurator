import { test, expect } from '@playwright/test';

test.describe('UIBuilder Drag and Drop Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the UIBuilder page
    await page.goto('http://localhost:5173/ui-builder');
  });

  test('dnd all components in preview area', async ({ page }) => {
    const headingComponent = page.locator(
      '[data-testid="draggable-component-heading"]',
    );
    await expect(headingComponent).toBeVisible();
    const paragraphComponent = page.locator(
      '[data-testid="draggable-component-paragraph"]',
    );
    await expect(paragraphComponent).toBeVisible();
    const filterAreaComponent = page.locator(
      '[data-testid="draggable-component-filterArea"]',
    );
    await expect(filterAreaComponent).toBeVisible();
    const buttonBarComponent = page.locator(
      '[data-testid="draggable-component-buttonBar"]',
    );
    await expect(buttonBarComponent).toBeVisible();
    const tableComponent = page.locator(
      '[data-testid="draggable-component-table"]',
    );
    await expect(tableComponent).toBeVisible();
    const chartComponent = page.locator(
      '[data-testid="draggable-component-chart"]',
    );
    await expect(chartComponent).toBeVisible();

    const dropZone = page.locator('[data-testid="preview-area"]');
    await expect(dropZone).toBeVisible();

    await headingComponent.dragTo(dropZone);
    await paragraphComponent.dragTo(dropZone);
    await filterAreaComponent.dragTo(dropZone);
    await buttonBarComponent.dragTo(dropZone);
    await tableComponent.dragTo(dropZone);
    await chartComponent.dragTo(dropZone);

    await expect(
      dropZone.locator('[data-testid="sortable-component-heading"]'),
    ).toBeVisible();
    await expect(
      dropZone.locator('[data-testid="sortable-component-paragraph"]'),
    ).toBeVisible();
    await expect(
      dropZone.locator('[data-testid="sortable-component-filterArea"]'),
    ).toBeVisible();
    await expect(
      dropZone.locator('[data-testid="sortable-component-buttonBar"]'),
    ).toBeVisible();
    await expect(
      dropZone.locator('[data-testid="sortable-component-table"]'),
    ).toBeVisible();
    await expect(
      dropZone.locator('[data-testid="sortable-component-chart"]'),
    ).toBeVisible();
  });
});
