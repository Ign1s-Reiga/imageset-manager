// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import stylistic from '@stylistic/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import next from '@next/eslint-plugin-next';

export default [
  {
    ignores: ['.next/', 'next-env.d.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  reactRecommended,
  reactJsxRuntime,
  stylistic.configs.customize({
    braceStyle: '1tbs',
    commaDangle: 'always-multiline',
    semi: true,
    jsx: true,
  }),
  {
    files: ['**/*.ts', '**/*.tsx', 'eslint.config.mjs', 'next.config.mjs'],
    plugins: {
      'react-hooks': reactHooks,
      '@next/next': next,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
      '@next/next/no-img-element': 'error',

      // Override ESLint Rules
      'no-prototype-builtins': 'off',

      // Override Stylistic Rules
      '@stylistic/arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
      '@stylistic/jsx-curly-spacing': ['error', { when: 'never' }],
      '@stylistic/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],
      '@stylistic/jsx-quotes': ['error', 'prefer-single'],
      '@stylistic/no-trailing-spaces': ['error', { ignoreComments: true }],
      '@stylistic/padded-blocks': 'off',
      '@stylistic/quote-props': 'off',

      // Override Typescript Plugin Rules
      '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true }],
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],

      // Disable Rules for Pages Router
      '@next/next/no-document-import-in-page': 'off',
      '@next/next/no-duplicate-head': 'off',
      '@next/next/no-head-import-in-document': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@next/next/no-styled-jsx-in-document': 'off',
    },
  },
];
