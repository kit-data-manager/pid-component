// This file has been automatically migrated to valid ESM format by Storybook.
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

// @ts-ignore
const require = createRequire(import.meta.url);
export default {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-a11y'),
  ],
  staticDirs: [
    { from: '../dist', to: '/assets' },
  ],
  framework: getAbsolutePath('@storybook/web-components-vite'),
  docs: {
    source: {
      type: 'code',
    },
  },
  core: {
    disableTelemetry: true,
  },
};

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
