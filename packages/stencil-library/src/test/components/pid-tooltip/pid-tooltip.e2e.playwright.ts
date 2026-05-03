import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test.describe('pid-tooltip e2e', () => {
  test('should render the component', async ({ page }) => {
    await page.goto('/test/components/pid-tooltip/pid-tooltip.e2e.html');
    const component = page.locator('pid-tooltip');
    await expect(component).toBeVisible();
  });

  test('tooltip button should be visible', async ({ page }) => {
    await page.goto('/test/components/pid-tooltip/pid-tooltip.e2e.html');
    const button = page.locator('pid-tooltip button');
    await expect(button).toBeVisible();
  });

  test('should show tooltip on hover', async ({ page }) => {
    await page.goto('/test/components/pid-tooltip/pid-tooltip.e2e.html');
    const tooltip = page.locator('pid-tooltip');
    const button = tooltip.locator('button');

    await button.hover();
    await page.waitForTimeout(100);

    const tooltipContent = tooltip.locator('[role="tooltip"]');
    await expect(tooltipContent).toBeVisible();
  });

  test('should hide tooltip when mouse leaves', async ({ page }) => {
    await page.goto('/test/components/pid-tooltip/pid-tooltip.e2e.html');
    const tooltip = page.locator('pid-tooltip');
    const button = tooltip.locator('button');

    await button.hover();
    await page.waitForTimeout(100);

    const tooltipContent = tooltip.locator('[role="tooltip"]');
    await expect(tooltipContent).toBeVisible();

    await button.unhover();
    await page.waitForTimeout(100);

    await expect(tooltipContent).not.toBeVisible();
  });

  test('should toggle tooltip on click', async ({ page }) => {
    await page.goto('/test/components/pid-tooltip/pid-tooltip.e2e.html');
    const tooltip = page.locator('pid-tooltip');
    const button = tooltip.locator('button');

    await expect(button).toBeVisible();

    await button.click();
    await page.waitForTimeout(100);

    const tooltipContent = tooltip.locator('[role="tooltip"]');
    await expect(tooltipContent).toBeVisible();

    await button.click();
    await page.waitForTimeout(100);

    await expect(tooltipContent).not.toBeVisible();
  });

  test('should have correct aria-expanded on hover', async ({ page }) => {
    await page.goto('/test/components/pid-tooltip/pid-tooltip.e2e.html');
    const tooltip = page.locator('pid-tooltip');
    const button = tooltip.locator('button');

    await expect(button).toHaveAttribute('aria-expanded', 'false');

    await button.hover();
    await page.waitForTimeout(100);

    await expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  test('should show tooltip content with correct text', async ({ page }) => {
    await page.goto('/test/components/pid-tooltip/pid-tooltip.e2e.html');
    const tooltip = page.locator('pid-tooltip');
    const button = tooltip.locator('button');

    await button.hover();
    await page.waitForTimeout(100);

    const tooltipContent = tooltip.locator('[role="tooltip"]');
    await expect(tooltipContent).toContainText('This is the tooltip text that appears on hover');
  });

  test('top position tooltip should display above button', async ({ page }) => {
    await page.goto('/test/components/pid-tooltip/pid-tooltip.e2e.html');
    const tooltip = page.locator('pid-tooltip').nth(1);
    const button = tooltip.locator('button');

    await button.hover();
    await page.waitForTimeout(100);

    const tooltipContent = tooltip.locator('[role="tooltip"]');
    await expect(tooltipContent).toBeVisible();
    await expect(tooltipContent).toHaveClass(/bottom-full/);
  });

  test('bottom position tooltip should display below button', async ({ page }) => {
    await page.goto('/test/components/pid-tooltip/pid-tooltip.e2e.html');
    const tooltip = page.locator('pid-tooltip').nth(2);
    const button = tooltip.locator('button');

    await button.hover();
    await page.waitForTimeout(100);

    const tooltipContent = tooltip.locator('[role="tooltip"]');
    await expect(tooltipContent).toBeVisible();
    await expect(tooltipContent).toHaveClass(/top-full/);
  });
});