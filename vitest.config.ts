import { defineConfig, type Plugin } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// The Storybook preview.ts imports individual components from
// dist/components/ (dist-custom-elements output). That output is only
// available after a full `stencil build`, not after `stencil-test` dev
// builds. During vitest runs the lazy-loader in vitest-setup.ts already
// registers every component, so we stub the custom-element imports out.
function stubDistCustomElements(): Plugin {
  const stubCode = 'export function defineCustomElement() {}';
  return {
    name: 'stub-dist-custom-elements',
    enforce: 'pre',
    resolveId(id, importer) {
      if (importer && id.includes('dist/components/') && id.endsWith('.js')) {
        return '\0stub-define-custom-element';
      }
    },
    load(id) {
      if (id === '\0stub-define-custom-element') {
        return stubCode;
      }
    },
  };
}

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [
          stubDistCustomElements(),
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
