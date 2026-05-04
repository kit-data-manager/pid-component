// This file has been automatically migrated to valid ESM format by Storybook.
import type { StorybookConfig } from '@storybook/vue3-vite';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { codecovVitePlugin } from '@codecov/vite-plugin';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const stencilRoot = path.resolve(__dirname, '../../stencil-library');

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  framework: getAbsolutePath('@storybook/vue3-vite'),
  core: { disableTelemetry: true },
  addons: [getAbsolutePath('@storybook/addon-docs'), getAbsolutePath('@storybook/addon-a11y')],
  viteFinal: async (config) => {
    // Dynamic import to avoid ESM resolution failure in npm workspaces
    // (the package is hoisted to root node_modules but ESM resolves
    // relative to this file's location)
    const { default: vue } = await import('@vitejs/plugin-vue');

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'vue/server-renderer': path.dirname(require.resolve('@vue/server-renderer')),
      '@kit-data-manager/pid-component/dist': path.join(stencilRoot, 'dist'),
      '@kit-data-manager/pid-component': stencilRoot,
    };
    config.plugins = config.plugins || [];
    config.plugins.push(vue());
    config.plugins.push(codecovVitePlugin({ enableBundleAnalysis: true }));
    return config;
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
