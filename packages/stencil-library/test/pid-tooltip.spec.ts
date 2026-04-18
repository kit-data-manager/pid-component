import { expect, test } from '@playwright/test';

test.describe('PID Tooltip', () => {
  test('should show on hover and hide on unhover', async ({ page }) => {
    await page.goto('/iframe.html?id=internal-tooltip--default&viewMode=story');

    const tooltipElement = page.locator('pid-tooltip');
    const tooltipText = page.locator('pid-tooltip [role="tooltip"]');

    // Initially hidden
    await expect(tooltipText).toBeHidden();

    // Hover over the trigger
    await tooltipElement.hover();
    await expect(tooltipText).toBeVisible();
    await expect(tooltipText).toContainText('This is a tooltip');

    // Unhover
    await page.mouse.move(0, 0);
    await expect(tooltipText).toBeHidden();
  });

  test('should show on focus and dismiss on Escape', async ({ page }) => {
    await page.goto('/iframe.html?id=internal-tooltip--default&viewMode=story');

    const button = page.locator('pid-tooltip button');
    const tooltipText = page.locator('pid-tooltip [role="tooltip"]');

    // Focus to show
    await button.focus();
    await expect(tooltipText).toBeVisible();

    // Visual regression test while open
    await expect(page).toHaveScreenshot('tooltip-open.png');

    // Press Escape
    await page.keyboard.press('Escape');
    await expect(tooltipText).toBeHidden();
  });
});
