import { defineVitestConfig } from '@stencil/vitest/config';

// Build the list of test projects. The browser project requires
// the 'playwright' package which may not be installed during
// unit-test-only runs. We try to load it and silently omit the
// browser project when it is unavailable.
const projects: any[] = [
  // Spec tests – node DOM (Stencil mock-doc) for unit/integration tests
  {
    test: {
      name: 'spec',
      include: ['src/**/*.spec.{ts,tsx}'],
      environment: 'stencil',
      setupFiles: ['./vitest-setup.ts'],
    },
  },
];

try {
  // Verify 'playwright' itself is available before setting up the browser project.
  // @vitest/browser-playwright lazily imports 'playwright' at runtime, which
  // causes an unhandled error if the package is missing.
  require.resolve('playwright');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { playwright } = require('@vitest/browser-playwright');
  projects.push({
    test: {
      name: 'browser',
      include: ['src/**/*.e2e.{ts,tsx}'],
      setupFiles: ['./vitest-setup.ts'],
      browser: {
        enabled: true,
        provider: playwright(),
        headless: true,
        instances: [{ browser: 'chromium' }],
      },
    },
  });
} catch {
  // playwright is not installed — skip browser tests
}

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  test: {
    projects,
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'json', 'json-summary', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.ts',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.e2e.{ts,tsx}',
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/components.d.ts',
      ],
    },
  },
});
