import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:6006/iframe.html?globals=&args=&id=pid-component--default&viewMode=story');
  await expect(page.locator('body')).toMatchAriaSnapshot(`
    - text: /This component displays information about the identifier \\d+\\.\\d+\\/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343\\. It can be expanded to show more details\\./
    - group:
      - text: /\\d+\\.\\d+ \\/ B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343/
      - button "Copy content to clipboard"
    `);
  await expect(page.locator('body')).toBeVisible();
  await page.locator('summary svg').click();
  await expect(page.locator('.grow').first()).toBeVisible();
  await page.locator('.flex.items-center.justify-between.gap-2.p-2').click();
  await page.getByRole('navigation', { name: 'Pagination controls and' }).click();
  await expect(page.getByLabel('Pagination controls for 21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343 data').getByLabel('Pagination controls and')).toMatchAriaSnapshot(`
    - navigation "Pagination controls and display settings":
      - group "Items per page options":
        - toolbar "Items per page:":
          - button "Show 5 items per page"
          - button /Show \\d+ items per page/ [pressed]
          - button /Show \\d+ items per page/
          - button /Show \\d+ items per page/
          - button /Show \\d+ items per page/
      - status: /Showing 1-\\d+ of \\d+/
      - navigation "Pagination":
        - button "Previous page" [disabled]
        - button "Page 1"
        - button "Page 2"
        - button "Next page"
    `);
  await page.locator('.flex.items-center.justify-between.gap-2.p-2').click();
  await page.getByLabel('Collapsible section for [').locator('summary svg').click();
  await expect(page.getByLabel('Collapsible section for [').locator('div').filter({ hasText: 'Could not display JSON data.' }).first()).toBeVisible();
  await expect(page.getByLabel('Collapsible section for [').locator('details')).toMatchAriaSnapshot(`
    - group:
      - text: "Object { 2 items }"
      - region "JSON Viewer":
        - text: JSON Viewer (1 property)
        - button "Switch to code view"
        - group "JSON data in tree view":
          - button "Copy JSON to clipboard"
          - 'treeitem "sha160sum: \\"sha160 6f1f5d3c9540b85f47ae08c7a5b9aa151b818a97\\" (string)"'
    `);
});
