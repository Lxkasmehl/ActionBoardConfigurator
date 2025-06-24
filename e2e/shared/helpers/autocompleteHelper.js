export async function selectFromAutocomplete(
  page,
  testId,
  optionName,
  sectionIndex = 0,
  options = {},
) {
  const { useSection = true, buttonTitle = 'Open' } = options;

  let element = page;
  if (useSection) {
    const sections = page.getByTestId('entity-section');
    element = sections.nth(sectionIndex);
  }

  const autocompleteButton = element
    .getByTestId(testId)
    .getByRole('button', { title: buttonTitle })
    .last();

  await autocompleteButton.click();

  // Wait for the option to be visible and stable
  const option = page.getByRole('option', { name: optionName, exact: true });
  await option.waitFor({ state: 'visible', timeout: 15000 });

  // Wait for the option to be stable and ready for interaction
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Try multiple approaches to click the option
  try {
    // First try: regular click
    await option.click({ timeout: 10000 });
  } catch (error) {
    try {
      // Second try: force click
      await option.click({ timeout: 10000, force: true });
    } catch (secondError) {
      try {
        // Third try: wait a bit more and try again
        await new Promise((resolve) => setTimeout(resolve, 500));
        await option.click({ timeout: 10000, force: true });
      } catch (thirdError) {
        // Fourth try: use keyboard navigation as fallback
        await option.focus();
        await page.keyboard.press('Enter');
      }
    }
  }

  // Wait a moment for the selection to be processed
  await new Promise((resolve) => setTimeout(resolve, 500));
}
