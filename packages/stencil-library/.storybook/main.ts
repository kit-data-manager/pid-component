import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
export default {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [getAbsolutePath('@storybook/addon-links'), getAbsolutePath('@storybook/addon-docs')],
  staticDirs: [
    { from: '../dist', to: '/assets' },
    { from: '../loader', to: '/assets' },
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
