import { setupFlowConnection } from '../../features/datapicker/helpers/flowSetup';
import { setupFilterCondition } from '../../features/datapicker/helpers/filterSetup';
import { selectFromAutocomplete } from './autocompleteHelper';

export async function setupTestData(page) {
  await setupFlowConnection(page);
  await page.locator('button svg[data-testid="AddIcon"]').click();

  const sections = page.getByTestId('entity-section');
  await sections.first().locator('div[class*="source"]').click();
  await sections.last().locator('div[class*="target"]').click();

  // Setup first section
  await selectFromAutocomplete(
    page,
    'entity-autocomplete',
    'FOBusinessUnit',
    0,
  );
  await setupFilterCondition(page, 'externalCode', '=', 'BU_003', 0);
  await selectFromAutocomplete(page, 'property-selector', 'createdDateTime', 0);

  // Setup second section
  await selectFromAutocomplete(page, 'entity-autocomplete', 'Candidate', 1);
  await setupFilterCondition(page, 'lastModifiedDateTime', '<', null, 1, true);
  await selectFromAutocomplete(page, 'property-selector', 'lastName', 1);
}
