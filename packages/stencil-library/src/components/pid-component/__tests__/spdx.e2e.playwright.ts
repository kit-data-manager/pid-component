import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test.describe('spdx e2e', () => {
  test('renders live license data for a bare Apache-2.0 value', async ({ page }) => {
    await page.goto('/src/components/pid-component/__tests__/spdx.e2e.html');
    const apache = page.locator('pid-component[data-testid="spdx-apache"]');
    await expect(apache).toContainText('Apache License 2.0', { timeout: 20000 });
  });

  test('renders fallback preview for a bare MIT value', async ({ page }) => {
    await page.goto('/src/components/pid-component/__tests__/spdx.e2e.html');
    const mit = page.locator('pid-component[data-testid="spdx-mit"]');
    await expect(mit).toContainText('MIT', { timeout: 20000 });
  });
});
