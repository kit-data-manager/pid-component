/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions', {
    name: '@storybook/addon-styling',
    options: {
      // Check out https://github.com/storybookjs/addon-styling/blob/main/docs/api.md
      // For more details on this addon's options.
      postCss: {
        implementation: require.resolve('postcss')
      }
    }
  }],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  docs: {
    autodocs: 'tag',
    toc: {
      contentsSelector: '.sbdocs-content',
      headingSelector: 'h1, h2, h3',
      title: 'Table of Contents',
      disable: false,
      unsafeTocbotOptions: {
        orderedList: false,
      },
    }
  }
};
export default config;
