import type { StorybookConfig } from '@storybook/angular';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stencilRoot = path.resolve(__dirname, '../../stencil-library');

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  framework: '@storybook/angular',
  core: { disableTelemetry: true },
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  webpackFinal: async (config) => {
    // Angular Storybook uses webpack, which cannot resolve the Stencil
    // library's package.json "exports" subpaths. We add webpack aliases
    // so that imports like
    //   @kit-data-manager/pid-component/dist/components/pid-component.js
    //   @kit-data-manager/pid-component/components/pid-component.js
    // resolve to the actual files in the workspace-linked package.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@kit-data-manager/pid-component/dist': path.join(stencilRoot, 'dist'),
      '@kit-data-manager/pid-component/components': path.join(stencilRoot, 'dist/components'),
      '@kit-data-manager/pid-component': stencilRoot,
    };
    return config;
  },
};
export default config;
