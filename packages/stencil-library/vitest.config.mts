import { defineVitestConfig } from '@stencil/vitest/config';
import { stencilVitestPlugin } from '@stencil/vitest/plugin';
import { playwright } from '@vitest/browser-playwright';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  resolve: {
    alias: [
      { find: '@test-fixtures', replacement: resolve(repoRoot, 'examples/fixtures') },
      { find: '@examples', replacement: resolve(repoRoot, 'examples') },
    ],
  },
  test: {
    testTimeout: 60000,
    hookTimeout: 60000,
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.unit.ts', 'src/**/*.unit.tsx'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'spec',
          include: ['src/**/*.spec.tsx'],
          exclude: ['src/**/*.source.spec.tsx'],
          environment: 'stencil',
          setupFiles: ['./vitest-setup.ts'],
          testTimeout: 30000,
        },
      },
      {
        plugins: [stencilVitestPlugin()],
        test: {
          name: 'source',
          include: ['src/**/*.source.spec.tsx'],
          environment: 'stencil',
        },
      },
      {
        test: {
          name: 'browser',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./vitest-setup.ts'],
          testTimeout: 120000,
          hookTimeout: 120000,
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [
              { browser: 'chromium' },
              { browser: 'firefox' },
              { browser: 'webkit' },
            ],
          },
        },
      },
    ],
    coverage: {
      provider: 'istanbul',
      enabled: true,
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov', 'teamcity'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.ts',
        'src/**/*.unit.{ts,tsx}',
        'src/**/*.spec.tsx',
        'src/**/*.test.tsx',
        'src/**/*.source.spec.tsx',
        'src/**/__tests__/**',
        'src/components.d.ts',
        'src/utils/__tests__/axe-helper.ts',
        'src/utils/__tests__/setup-axe.ts',
      ],
    },
  },
});
