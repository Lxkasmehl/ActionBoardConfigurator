import { test, expect } from '@playwright/test';
import { setupFlowConnection } from '../../datapicker/helpers/flowSetup';

// Helper function to setup dynamic data editing
export async function setupDynamicDataEditing(
  page,
  sortableComponent,
  leftSteps,
  isTextarea = false,
  isAlreadyConfigured = false,
) {
  await page.setViewportSize({ width: 1920, height: 1080 });
  test.setTimeout(120000);

  await sortableComponent
    .getByTestId('editable-text-component-edit-button')
    .click();

  const inputField = sortableComponent
    .getByTestId('editable-text-component-input')
    .locator(isTextarea ? 'textarea:not([aria-hidden="true"])' : 'input');

  await inputField.click();
  await inputField.press('Control+End');
  for (let i = 0; i < leftSteps; i++) {
    await inputField.press('ArrowLeft');
  }
  await inputField.type(' [[');

  await expect(page.getByTestId('flow-start')).toBeVisible({
    timeout: 15000,
  });

  const containerLocator = page.getByTestId('data-picker-container');
  if (!isAlreadyConfigured) {
    await setupFlowConnection(containerLocator, true);
  }

  return { containerLocator, sortableComponent };
}

// Helper function to get border color of an element
export async function getBorderColor(element) {
  return element.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return style.borderColor;
  });
}

// Helper function to verify border colors are different
export async function verifyBorderColorsDifferent(page) {
  const firstButtonBarColor = await getBorderColor(
    page.getByTestId('sortable-component-buttonBar').first(),
  );
  const secondButtonBarColor = await getBorderColor(
    page.getByTestId('sortable-component-buttonBar').last(),
  );
  const firstTableColor = await getBorderColor(
    page.getByTestId('sortable-component-table').first(),
  );
  const secondTableColor = await getBorderColor(
    page.getByTestId('sortable-component-table').last(),
  );

  expect(firstButtonBarColor).not.toBe(secondButtonBarColor);
  expect(firstTableColor).not.toBe(secondTableColor);
  expect(firstButtonBarColor).toBe(secondTableColor);
  expect(secondButtonBarColor).toBe(firstTableColor);
}
