import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs', globals: globals.node } },
  { languageOptions: { globals: globals.browser } },
  { ignores: ['node_modules/', 'dist/', 'www/', 'loader/', '.stencil/', 'storybook-static', 'hydrate/', 'coverage/'] },
  eslintConfigPrettier,
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  // Allow underscore-prefixed variables to be unused (common for mock params).
  // Also tell ESLint that `h` is the JSX factory and shouldn't be flagged unused.
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^(_|h$)',
        },
      ],
    },
  },
  // Relax rules for test files, setup files, and config files where
  // mocks, type casts, and dynamic patterns make strict typing impractical.
  {
    files: [
      'src/test/**',
      'src/**/__tests__/**',
      '**/*.spec.{ts,tsx}',
      '**/*.e2e.{ts,tsx}',
      '**/*.unit.{ts,tsx}',
      'vitest-setup.ts',
      'vitest-setup-source.ts',
      'vitest.config.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
