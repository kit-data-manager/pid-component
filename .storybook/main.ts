import type { StorybookConfig } from '@storybook/web-components-vite';
import type { PluginOption } from 'vite';

/**
 * Vite plugin that stubs the compile-time-only decorator exports from
 * @stencil/core.  Stencil's own compiler strips these decorators during
 * its build, but Vite/Rolldown doesn't know that and will fail with
 * MISSING_EXPORT errors when it encounters raw .tsx source files that
 * import them.  We re-export everything the runtime provides plus no-op
 * stubs for the decorators so the module graph resolves cleanly.
 */
function stencilCoreStubs(): PluginOption {
  const STENCIL_CORE_ID = '\0stencil-core-stubs';
  return {
    name: 'stencil-core-stubs',
    enforce: 'pre',
    resolveId(id) {
      if (id === '@stencil/core') {
        return STENCIL_CORE_ID;
      }
    },
    load(id) {
      if (id === STENCIL_CORE_ID) {
        return `
export { Build, forceUpdate, getAssetPath, getElement, getMode,
  getRenderingRef, h, Host, Mixin, readTask, render, setAssetPath,
  setErrorHandler, setMode, setPlatformHelpers, writeTask
} from '@stencil/core/internal/client';

/* compile-time decorator stubs – never called at runtime */
const noop = () => () => {};
export const Component = noop;
export const Element = noop;
export const Event = noop;
export const Listen = noop;
export const Method = noop;
export const Prop = noop;
export const State = noop;
export const Watch = noop;
`;
      }
    },
  };
}

const config: StorybookConfig = {
  stories: [
    '../packages/stencil-library/src/**/*.mdx',
    '../packages/stencil-library/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '*.stories.ts',
    '*.mdx',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@chromatic-com/storybook',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-themes',
  ],
  framework: '@storybook/web-components-vite',
  docs: {
    source: {
      type: 'code',
    },
  },
  core: {
    disableTelemetry: true,
  },
  async viteFinal(config) {
    config.plugins = config.plugins || [];
    config.plugins.push(stencilCoreStubs());

    // Prevent lightningcss from choking on Tailwind v4 at-rules (@theme,
    // @tailwind, @custom-variant) that it does not understand.  Use postcss
    // for transformation and esbuild for minification instead of lightningcss.
    config.css = {
      ...config.css,
      transformer: 'postcss',
    };
    config.build = {
      ...config.build,
      cssMinify: 'esbuild',
    };

    return config;
  },
  // Storybook Composition: framework sub-Storybooks
  refs: (config, { configType }) => {
    if (configType === 'DEVELOPMENT') {
      return {
        'react-vite': { title: 'React (Vite)', url: 'http://localhost:6007', expanded: true },
        'react-nextjs': { title: 'React (Next.js)', url: 'http://localhost:6010', expanded: true },
        'vue': { title: 'Vue 3', url: 'http://localhost:6008', expanded: true },
        'angular': { title: 'Angular', url: 'http://localhost:6009', expanded: true },
      };
    }
    return {
      'react-vite': { title: 'React (Vite)', url: './react-vite', expanded: true },
      'react-nextjs': { title: 'React (Next.js)', url: './react-nextjs', expanded: true },
      'vue': { title: 'Vue 3', url: './vue', expanded: true },
      'angular': { title: 'Angular', url: './angular', expanded: true },
    };
  },
};

export default config;
