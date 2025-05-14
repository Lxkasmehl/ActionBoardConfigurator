import { expect } from '@playwright/test';
import { selectFromAutocomplete } from '../../../helpers/autocompleteHelper';

// Helper function to create and verify a group of components
export async function createAndVerifyGroup(page, components, groupName) {
  await page.getByTestId('create-edit-group-button').click();
  await page.getByTestId('create-new-group-button').click();

  // Wait for group creation dialog to be ready
  await page.getByTestId('group-name-input').waitFor({ state: 'visible' });

  // Click all components using force: true to bypass the enabled check
  for (const component of components) {
    await component.click({ force: true });
  }

  const groupNameInput = page.getByTestId('group-name-input').locator('input');
  await groupNameInput.fill(groupName);
  await page.getByTestId('save-new-group-button').click();

  // Verify all components have the same border color
  const firstComponentBorderColor = await components[0].evaluate((el) => {
    const style = window.getComputedStyle(el);
    return style.borderColor;
  });

  // Verify all other components have the same border color
  for (let i = 1; i < components.length; i++) {
    const currentBorderColor = await components[i].evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.borderColor;
    });
    expect(currentBorderColor).toBe(firstComponentBorderColor);
  }
}

// Helper function to create and verify a group with border color checking
export async function createAndVerifyGroupWithBorderCheck(
  page,
  components,
  groupName,
) {
  await createAndVerifyGroup(page, components, groupName);

  // Get border color of the group
  const groupBorderColor = await components[0].evaluate((el) => {
    const style = window.getComputedStyle(el);
    return style.borderColor;
  });

  return groupBorderColor;
}

export async function editGroup(page, groupName, buttonBarIndices) {
  await page.getByTestId('create-edit-group-button').click();
  await page.getByTestId('edit-existing-group-button').click();

  await selectFromAutocomplete(page, 'group-selector', groupName, 0, {
    useSection: false,
  });

  for (const index of buttonBarIndices) {
    await page.getByTestId('sortable-component-buttonBar').nth(index).click({
      force: true,
    });
  }

  await page.getByTestId('save-edited-group-button').click();
}
