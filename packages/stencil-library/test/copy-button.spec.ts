import { expect, test } from '@playwright/test';

test.describe('Copy Button', () => {
  test('should copy text to clipboard and change icon', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Clipboard API can be flaky in WebKit without special permissions');

    // Go to the isolated story view
    await page.goto('/iframe.html?id=internal-copy-button--default&viewMode=story');

    const button = page.locator('copy-button button');

    // Check initial state
    await expect(button).toBeVisible();
    await expect(button).toContainText('Copy');

    // Setup clipboard permissions
    const context = page.context();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Click to copy
    await button.click();

    // Verify button state changes
    await expect(button).toContainText('Copied!');

    // Verify visual state
    await expect(page).toHaveScreenshot('copy-button-copied.png');
  });
});
