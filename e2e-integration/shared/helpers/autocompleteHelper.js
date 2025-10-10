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

  // Find the autocomplete component
  const autocompleteComponent = element.getByTestId(testId);
  await autocompleteComponent.waitFor({ state: 'visible', timeout: 10000 });

  // Try multiple strategies to find and click the button
  let autocompleteButton = null;
  const buttonStrategies = [
    () => autocompleteComponent.getByRole('button', { title: buttonTitle }),
    () => autocompleteComponent.getByRole('button'),
    () => autocompleteComponent.locator('button[aria-haspopup="listbox"]'),
    () => autocompleteComponent.locator('input'),
    () => autocompleteComponent.locator('[role="combobox"]'),
  ];

  for (let i = 0; i < buttonStrategies.length; i++) {
    try {
      autocompleteButton = buttonStrategies[i]();
      await autocompleteButton.waitFor({ state: 'visible', timeout: 5000 });
      break;
    } catch (error) {
      if (i === buttonStrategies.length - 1) {
        throw new Error(
          `Could not find autocomplete button for testId: ${testId}`,
        );
      }
    }
  }

  // Click the button
  try {
    await autocompleteButton.click();
  } catch (error) {
    await autocompleteButton.click({ force: true });
  }

  // Try typing to trigger dropdown if it's an input field
  try {
    const input = autocompleteComponent.locator('input');
    if (await input.isVisible()) {
      await input.focus();
      // WORKAROUND: This substring workaround is necessary due to a CSS positioning issue
      // The MuiAutocomplete-listbox has an !important inset style that causes positioning problems
      // in the development environment, making the dropdown not properly visible for tests.
      // By typing only the first 4 characters, we can still trigger the autocomplete functionality
      // and allow tests to work around the positioning issue. This workaround cannot be removed
      // because the !important inset style is required for proper positioning in the production
      // environment when the app runs within SuccessFactors. However, this solution is not perfect
      // and may need to be redesigned as similar positioning issues are already appearing in
      // production with other autocomplete components.
      await input.type(optionName.substring(0, 4));
      await page.waitForTimeout(500);
    }
  } catch (error) {
    // Ignore input typing errors
  }

  // Wait for the dropdown to appear
  try {
    await page.waitForSelector(
      '[role="listbox"], [role="menu"], .MuiAutocomplete-popper, .MuiPopper-root, [data-testid*="option"]',
      { timeout: 5000 },
    );
  } catch (error) {
    try {
      await page.waitForSelector(
        'li, [role="option"], .MuiAutocomplete-option',
        { timeout: 5000 },
      );
    } catch (error2) {
      await page.waitForTimeout(2000);
    }
  }

  // Find the option
  let option = null;
  const optionStrategies = [
    () => page.getByRole('option', { name: optionName, exact: true }),
    () => page.getByRole('option', { name: optionName }),
    () => page.locator(`[role="option"]:has-text("${optionName}")`),
    () => page.locator(`li:has-text("${optionName}")`),
    () => page.locator(`.MuiAutocomplete-option:has-text("${optionName}")`),
    () => page.locator(`text="${optionName}"`),
    () => page.locator(`text=/.*${optionName}.*/i`),
  ];

  for (let i = 0; i < optionStrategies.length; i++) {
    try {
      option = optionStrategies[i]();
      await option.waitFor({ state: 'visible', timeout: 5000 });
      break;
    } catch (error) {
      if (i === optionStrategies.length - 1) {
        const allOptions = await page
          .locator(
            '[role="option"], li, .MuiAutocomplete-option, [data-testid*="option"]',
          )
          .allTextContents();
        throw new Error(
          `Could not find option "${optionName}" for testId: ${testId}. Available options: ${allOptions.join(', ')}`,
        );
      }
    }
  }

  // Click the option
  await page.waitForTimeout(500);

  try {
    await option.click({ timeout: 10000 });
  } catch (error) {
    try {
      await option.click({ timeout: 10000, force: true });
    } catch (secondError) {
      try {
        await page.waitForTimeout(500);
        await option.click({ timeout: 10000, force: true });
      } catch (thirdError) {
        await option.focus();
        await page.keyboard.press('Enter');
      }
    }
  }

  await page.waitForTimeout(500);
}

/**
 * Specialized helper for MUI Joy autocomplete components
 * This function handles the specific case where the dropdown might not appear immediately
 */
export async function selectFromJoyAutocomplete(
  page,
  testId,
  optionName,
  options = {},
) {
  const { useSection = false } = options;

  let element = page;
  if (useSection) {
    const sections = page.getByTestId('entity-section');
    element = sections.nth(0);
  }

  // Find the autocomplete component
  const autocompleteComponent = element.getByTestId(testId);
  await autocompleteComponent.waitFor({ state: 'visible', timeout: 10000 });

  // Check if the component is disabled before proceeding
  const isDisabled = await autocompleteComponent.locator('input').isDisabled();
  if (isDisabled) {
    throw new Error(
      `Component with testId "${testId}" is disabled and cannot be interacted with`,
    );
  }

  // Try multiple approaches to open the dropdown
  // Approach 1: Click the component
  try {
    await autocompleteComponent.click();
  } catch (error) {
    // Ignore click errors
  }

  // Approach 2: Try clicking input field
  try {
    const input = autocompleteComponent.locator('input');
    if (await input.isVisible()) {
      await input.click();
    }
  } catch (error) {
    // Ignore input click errors
  }

  // Approach 3: Try typing to trigger dropdown
  try {
    const input = autocompleteComponent.locator('input');
    if (await input.isVisible()) {
      await input.focus();
      await input.clear();
      await input.type(optionName);
    }
  } catch (error) {
    // Ignore typing errors
  }

  // Wait for dropdown to appear with better error handling
  try {
    await page.waitForSelector(
      '[role="listbox"], [role="menu"], .MuiAutocomplete-popper, .MuiPopper-root, [data-testid*="option"]',
      { timeout: 5000 },
    );
  } catch (error) {
    try {
      await page.waitForSelector(
        'li, [role="option"], .MuiAutocomplete-option',
        { timeout: 5000 },
      );
    } catch (error2) {
      // If no dropdown appears, wait a bit and continue
      await page.waitForTimeout(1000);
    }
  }

  // Try to find the option with multiple strategies
  let option = null;
  const optionStrategies = [
    () => page.getByRole('option', { name: optionName, exact: true }),
    () => page.getByRole('option', { name: optionName }),
    () => page.locator(`*:has-text("${optionName}")`).first(),
    () => page.locator(`li:has-text("${optionName}")`),
    () =>
      page
        .locator(`[role="option"], li, button, div`)
        .filter({ hasText: optionName })
        .first(),
  ];

  for (let i = 0; i < optionStrategies.length; i++) {
    try {
      option = optionStrategies[i]();
      await option.waitFor({ state: 'visible', timeout: 3000 });
      break;
    } catch (error) {
      if (i === optionStrategies.length - 1) {
        const allOptions = await page
          .locator('[role="option"], li')
          .allTextContents();
        throw new Error(
          `Could not find option "${optionName}" for testId: ${testId}. Available options: ${allOptions.join(', ')}`,
        );
      }
    }
  }

  // Click the option
  await option.click();

  // Wait for selection to be processed
  await page.waitForTimeout(500);
}
