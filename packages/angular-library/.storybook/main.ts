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
    // library's package.json "exports" subpaths (e.g.
    // @kit-data-manager/pid-component/components/pid-component.js).
    // We add webpack aliases so these imports resolve correctly to the
    // built dist-custom-elements inside the workspace-linked package.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@kit-data-manager/pid-component/loader': path.join(stencilRoot, 'dist/loader'),
      '@kit-data-manager/pid-component/components': path.join(stencilRoot, 'dist/components'),
      '@kit-data-manager/pid-component': stencilRoot,
    };
    return config;
  },
};
export default config;
