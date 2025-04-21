export async function setupUIBuilder(page) {
  // Navigate to the UIBuilder page
  await page.goto('/uibuilder');

  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Add any common setup steps here
  // For example:
  // - Login if required
  // - Set up test data
  // - Wait for specific elements to be visible
}
