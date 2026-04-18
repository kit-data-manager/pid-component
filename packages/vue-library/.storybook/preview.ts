import { defineCustomElements } from '@kit-data-manager/pid-component/loader';
defineCustomElements();

export default {
  tags: ['autodocs'],
  parameters: {
    backgrounds: {
      options: {
        dark: { name: 'Dark', value: '#222' },
        light: { name: 'Light', value: '#F7F9F2' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};
