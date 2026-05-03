import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test.describe('copy-button e2e', () => {
  test('should render the button', async ({ page }) => {
    await page.goto('/test/components/copy-button/copy-button.e2e.html');
    const button = page.locator('copy-button button');
    await expect(button).toBeVisible();
  });

  test('button has correct aria-label', async ({ page }) => {
    await page.goto('/test/components/copy-button/copy-button.e2e.html');
    const button = page.locator('copy-button button');
    await expect(button).toHaveAttribute('aria-label', 'Copy DOI to clipboard');
  });

  test('button displays correct text', async ({ page }) => {
    await page.goto('/test/components/copy-button/copy-button.e2e.html');
    const button = page.locator('copy-button button');
    await expect(button).toContainText('Copy');
  });

  test('button has type=button attribute', async ({ page }) => {
    await page.goto('/test/components/copy-button/copy-button.e2e.html');
    const button = page.locator('copy-button button');
    await expect(button).toHaveAttribute('type', 'button');
  });
});