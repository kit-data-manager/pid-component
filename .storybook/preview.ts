import '../src/tailwind.css';
import { defineCustomElements } from '../loader';

defineCustomElements();

export default {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },

  tags: ['autodocs']
};
