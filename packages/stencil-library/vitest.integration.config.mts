import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Config for running the real-API integration tests in isolation.
 *
 * These tests hit live services and are intentionally NOT part of the
 * default vitest config / `npm test`, so CI stays offline and
 * deterministic. Run them explicitly with:
 *   npm run test:integration
 */
export default defineConfig({
  resolve: {
    alias: [
      { find: '@test-fixtures', replacement: resolve(repoRoot, 'examples/fixtures') },
      { find: '@examples', replacement: resolve(repoRoot, 'examples') },
    ],
  },
  test: {
    include: ['src/**/*.integration.ts'],
    environment: 'node',
    testTimeout: 120000,
    reporters: ['default'],
  },
});
