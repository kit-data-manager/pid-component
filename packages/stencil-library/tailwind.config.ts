import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}', './src/components/**/*.{ts,tsx}', './src/rendererModules/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-mode="dark"]'],
  theme: {
    extend: {
      resize: {
        both: 'both',
      },
    },
  },
  plugins: [],
} satisfies Config;
