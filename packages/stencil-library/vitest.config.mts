import { defineVitestConfig } from '@stencil/vitest/config';
import { stencilVitestPlugin } from '@stencil/vitest/plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  resolve: {
    alias: [
      { find: '@test-fixtures', replacement: '/Users/maximilian/GitHub/pid-component/examples/fixtures' },
      { find: '@examples', replacement: '/Users/maximilian/GitHub/pid-component/examples' },
    ],
  },
  test: {
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
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [
              { browser: 'chromium' },
            ],
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'json', 'json-summary', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.ts',
        'src/**/*.unit.{ts,tsx}',
        'src/**/*.spec.tsx',
        'src/**/*.test.tsx',
        'src/**/*.source.spec.tsx',
        'src/**/__tests__/**',
        'src/test/**',
        'src/components.d.ts',
        'src/utils/__tests__/axe-helper.ts',
        'src/utils/__tests__/setup-axe.ts',
      ],
    },
  },
});
