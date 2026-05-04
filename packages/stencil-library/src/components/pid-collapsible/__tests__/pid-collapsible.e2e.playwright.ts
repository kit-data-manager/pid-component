import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test.describe('pid-collapsible e2e', () => {
  test('should render the component', async ({ page }) => {
    await page.goto('/src/components/pid-collapsible/__tests__/pid-collapsible.e2e.html');
    const component = page.locator('pid-collapsible');
    await expect(component).toBeVisible();
  });
});