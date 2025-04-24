import { dragAndVerifyComponent } from './componentHelpers';
import { createAndVerifyGroupWithBorderCheck } from './groupHelpers';

// Helper function to setup multiple components in preview area
export async function setupComponentsInPreview(
  page,
  previewArea,
  componentTypes,
) {
  const components = {};
  for (const type of componentTypes) {
    const component = page.getByTestId(`draggable-component-${type}`);
    components[type] = await dragAndVerifyComponent(
      component,
      previewArea,
      type,
    );
  }
  return components;
}

// Helper function to setup and create a group
export async function setupAndCreateGroup(
  page,
  previewArea,
  groupTypes,
  groupName,
) {
  const components = await setupComponentsInPreview(
    page,
    previewArea,
    groupTypes,
  );
  const borderColor = await createAndVerifyGroupWithBorderCheck(
    page,
    Object.values(components),
    groupName,
  );
  return { components, borderColor };
}
