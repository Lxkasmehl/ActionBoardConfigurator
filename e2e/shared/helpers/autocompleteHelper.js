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

  // Use a more reliable click approach with retry
  await option.click({ timeout: 5000, force: true });

  // Focus and blur the button to close dropdown
  await autocompleteButton.focus();
  await autocompleteButton.evaluate((el) => el.blur());
}
