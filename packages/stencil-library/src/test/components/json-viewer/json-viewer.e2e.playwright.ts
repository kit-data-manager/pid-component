import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test.describe('json-viewer e2e', () => {
  test('should render the component', async ({ page }) => {
    await page.goto('/test/components/json-viewer/json-viewer.e2e.html');
    const component = page.locator('json-viewer');
    await expect(component).toBeVisible();
  });
});