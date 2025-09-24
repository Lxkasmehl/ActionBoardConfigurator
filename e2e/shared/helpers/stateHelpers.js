import { expect } from '@playwright/test';

export async function getSectionState(sections) {
  return await Promise.all(sections.map((section) => section.textContent()));
}

export async function getEdgeConnections(page) {
  const edges = await page.locator('[data-testid^="rf__edge-"]').all();
  return await Promise.all(
    edges.map(async (edge) => ({
      sourceId: await edge.getAttribute('data-source'),
      targetId: await edge.getAttribute('data-target'),
    })),
  );
}

export async function getFilterContent(page, sections) {
  const filterContent = [];
  for (let i = 0; i < sections.length; i++) {
    await sections[i].getByTestId('add-filter-button').click();
    const modal = page.getByTestId('filter-modal');
    await expect(modal).toBeVisible();
    filterContent.push(await modal.textContent());
    await page.getByTestId('filter-modal-save-button').click();
    await expect(modal).not.toBeVisible();
  }
  return filterContent;
}

export async function getResults(page) {
  await page.getByTestId('send-request-button').click();
  await page.getByTestId('KeyboardArrowRightIcon').click();
  return await page.getByTestId('results-modal').first().textContent();
}
