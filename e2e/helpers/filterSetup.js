import { expect } from '@playwright/test';

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

  const option = page.getByRole('option', { name: optionName, exact: true });

  await option.waitFor({ state: 'visible', timeout: 5000 });
  await expect(option).toBeEnabled();

  try {
    await option.click({ force: true, timeout: 10000 });
  } catch (error) {
    await page.waitForTimeout(1000);
    await option.click({ force: true, timeout: 10000 });
  }
}

export async function selectFilterProperty(page, propertyName) {
  await selectFromAutocomplete(
    page,
    'filter-property-autocomplete',
    propertyName,
    0,
    { useSection: false },
  );
}

export async function setupFilterCondition(
  page,
  propertyName,
  operator,
  value,
  sectionIndex = 0,
  useRelationalFilter = false,
) {
  const sections = page.getByTestId('entity-section');
  const targetSection = sections.nth(sectionIndex);

  await targetSection.getByTestId('add-filter-button').click();
  await page.getByTestId('add-condition-button').first().click();

  await selectFilterProperty(page, propertyName);

  await page.getByTestId('filter-operator-dropdown').click();
  await page.getByRole('option', { name: operator }).click();

  if (useRelationalFilter) {
    await page.getByTestId('related-source-select').click();
    await page.getByRole('option').first().click();
  } else if (value) {
    await page.getByPlaceholder('Enter a value').fill(value);
  }

  await page.getByTestId('filter-modal-save-button').click();
}

export async function setupComplexFilter(page, conditions) {
  await page.getByTestId('add-filter-button').click();
  await page.getByTestId('add-condition-group-button').click();

  for (const condition of conditions.groupConditions) {
    await page.getByTestId('add-condition-inside-group-button').click();
    await selectFilterProperty(page, condition.property);
    await page.getByTestId('filter-operator-dropdown').last().click();
    await page.getByRole('option', { name: condition.operator }).click();
    await page.getByPlaceholder('Enter a value').last().fill(condition.value);
  }

  for (const condition of conditions.standaloneConditions) {
    await page.getByTestId('add-condition-button').click();
    if (condition.logic) {
      await page.getByTestId('logic-selector').last().click();
      await page.getByRole('option', { name: condition.logic }).click();
    }
    await selectFilterProperty(page, condition.property);
    await page.getByTestId('filter-operator-dropdown').last().click();
    await page.getByRole('option', { name: condition.operator }).click();
    await page.getByPlaceholder('Enter a value').last().fill(condition.value);
  }

  await page.getByTestId('filter-modal-save-button').click();
}

export async function setupExpand(page, accordionId, propertyName) {
  await page
    .getByTestId(`accordion-${accordionId}`)
    .locator('button')
    .first()
    .click();

  await selectFromAutocomplete(
    page,
    `accordion-${accordionId}-property-selector`,
    propertyName,
  );
}

export async function setupNestedFilterCondition(
  page,
  properties,
  operator,
  value,
) {
  await page.getByTestId('add-filter-button').click();
  await page.getByTestId('add-condition-button').first().click();

  for (const property of properties) {
    await page
      .getByTestId('filter-property-autocomplete')
      .getByRole('button', { title: 'Open' })
      .last()
      .click();
    await page.getByRole('option', { name: property, exact: true }).click();
  }

  await page.getByTestId('filter-operator-dropdown').click();
  await page.getByRole('option', { name: operator }).click();

  if (value) {
    await page.getByPlaceholder('Enter a value').fill(value);
  }

  await page.getByTestId('filter-modal-save-button').click();
}
