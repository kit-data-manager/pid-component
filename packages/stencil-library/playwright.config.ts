import { expect } from '@playwright/test';
import { matchers, createConfig } from '@stencil/playwright';

expect.extend(matchers);

export default createConfig({
  testDir: './src/components',
  testMatch: '**/__tests__/*.e2e.playwright.ts',
  headless: true,
  viewport: { width: 1280, height: 720 },
  reporter: 'list',
});