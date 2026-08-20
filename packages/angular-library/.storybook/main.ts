// This file has been automatically migrated to valid ESM format by Storybook.
import type { StorybookConfig } from '@storybook/angular';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stencilRoot = path.resolve(__dirname, '../../stencil-library');

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  framework: getAbsolutePath('@storybook/angular'),
  core: { disableTelemetry: true },
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-mcp'),
  ],
  webpackFinal: async (config) => {
    const angularLibRoot = path.resolve(__dirname, '..');
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@kit-data-manager/pid-component/dist': path.join(stencilRoot, 'dist'),
      '@kit-data-manager/pid-component/components': path.join(stencilRoot, 'dist/components'),
      '@kit-data-manager/pid-component': stencilRoot,
      '@kit-data-manager/angular-pid-component': angularLibRoot,
    };

    config.module = config.module || { rules: [] };
    config.module.rules = config.module.rules || [];
    const cssRule = (config.module.rules as any[]).find(
      (r: any) => r && r.test && r.test.toString().includes('\\.css$'),
    );
    if (cssRule && (cssRule as any).use) {
      const postcssLoader = (cssRule as any).use.find(
        (u: any) => u && typeof u === 'object' && u.loader && u.loader.includes('postcss-loader'),
      );
      if (postcssLoader && !postcssLoader.options?.postcssOptions) {
        postcssLoader.options = postcssLoader.options || {};
        postcssLoader.options.postcssOptions = {
          plugins: [require('@tailwindcss/postcss')],
        };
      }
    }

    return config;
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
