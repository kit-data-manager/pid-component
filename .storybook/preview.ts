import '../src/tailwind.css';
import { defineCustomElements } from '../loader';

defineCustomElements();

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
