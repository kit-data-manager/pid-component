export default {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials'
  ],
  staticDirs: [{ from: '../dist', to: '/assets' }, { from: '../loader', to: '/assets' }],
  framework: '@storybook/web-components-vite',
  docs: {
    source: {
      type: 'code',
    }
  },
  core: {
    disableTelemetry: true,
  },
};
