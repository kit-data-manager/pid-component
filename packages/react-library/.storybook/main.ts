// This file has been automatically migrated to valid ESM format by Storybook.
import type { StorybookConfig } from '@storybook/react-vite';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stencilRoot = path.resolve(__dirname, '../../stencil-library');

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  framework: getAbsolutePath('@storybook/react-vite'),
  core: { disableTelemetry: true },
  addons: [getAbsolutePath('@storybook/addon-docs'), getAbsolutePath('@storybook/addon-a11y')],
  viteFinal: async (config) => {
    // Stencil's dist-custom-elements output lives under dist/components/.
    // Vite needs aliases so that imports like
    //   @kit-data-manager/pid-component/dist/components/pid-component.js
    // resolve to the actual files in the workspace-linked package.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@kit-data-manager/pid-component/dist': path.join(stencilRoot, 'dist'),
      '@kit-data-manager/pid-component': stencilRoot,
    };
    return config;
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
