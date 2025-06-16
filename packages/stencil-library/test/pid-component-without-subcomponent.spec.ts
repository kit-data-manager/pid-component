import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {
  test.setTimeout(30_000); // Increase timeout for the test
  await page.goto('http://localhost:6006/iframe.html?globals=&args=&id=pid-component--handle-without-subcomponent&viewMode=story');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('html')).toBeVisible();
  await page.getByRole('button', { name: 'Copy content to clipboard' }).click();
  await expect(page.locator('#storybook-root')).toBeVisible();
  await page.getByRole('button', { name: 'Copy content to clipboard' }).click();
  await expect(page.locator('body')).toMatchAriaSnapshot(`
    - text: /This component displays information about the identifier \\d+\\.\\d+\\/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343\\. It can be expanded to show more details\\./
    - button /Identifier preview for \\d+\\.\\d+\\/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343/:
      - button "Copy content to clipboard"
    `);
  await page.getByRole('button', { name: 'Identifier preview for 21.' }).click();
  await page.locator('body').click();
  await page.getByRole('button', { name: 'Copy content to clipboard' }).click();
  await expect(page.getByLabel('Copy content to clipboard')).toMatchAriaSnapshot(`- button "Copy content to clipboard"`);
});
