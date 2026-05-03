import { expect } from '@playwright/test';
import { matchers, createConfig } from '@stencil/playwright';

expect.extend(matchers);

export default createConfig({
  testDir: './src/test/components',
  testMatch: '**/*.e2e.playwright.ts',
  headless: true,
  viewport: { width: 1280, height: 720 },
  reporter: 'list',
});