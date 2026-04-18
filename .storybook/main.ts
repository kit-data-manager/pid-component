import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: [
    '../packages/stencil-library/src/**/*.mdx',
    '../packages/stencil-library/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@chromatic-com/storybook',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
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
  // Storybook Composition: framework sub-Storybooks
  refs: (config, { configType }) => {
    if (configType === 'DEVELOPMENT') {
      return {
        'react-vite': { title: 'React (Vite)', url: 'http://localhost:6007', expanded: false },
        'react-nextjs': { title: 'React (Next.js)', url: 'http://localhost:6010', expanded: false },
        vue: { title: 'Vue 3', url: 'http://localhost:6008', expanded: false },
        angular: { title: 'Angular', url: 'http://localhost:6009', expanded: false },
      };
    }
    return {
      'react-vite': { title: 'React (Vite)', url: './react-vite', expanded: false },
      'react-nextjs': { title: 'React (Next.js)', url: './react-nextjs', expanded: false },
      vue: { title: 'Vue 3', url: './vue', expanded: false },
      angular: { title: 'Angular', url: './angular', expanded: false },
    };
  },
};

export default config;
