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

  await element
    .getByTestId(testId)
    .getByRole('button', { title: buttonTitle })
    .last()
    .click();

  await page.getByRole('option', { name: optionName, exact: true }).waitFor({
    state: 'visible',
    timeout: 15000,
  });
  await page.getByRole('option', { name: optionName, exact: true }).click();
}
