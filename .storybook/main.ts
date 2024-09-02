const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  staticDirs: [{from: '../dist', to: '/assets'}, {from: '../loader', to: '/assets'}],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  docs: {},
  core: {
    disableTelemetry: true,
  }
};
export default config;
