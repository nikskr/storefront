import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist/', 'coverage/', 'node_modules/', '.netlify/']),

  js.configs.recommended,
  tseslint.configs.recommended,

  // Browser code
  {
    files: ['src/**/*.ts'],
    languageOptions: { globals: globals.browser },
  },

  // Tooling configs, build scripts and Netlify Functions run in Node
  {
    files: ['*.{js,mjs,cjs,ts}', 'scripts/**/*.mjs', 'netlify/**/*.ts'],
    languageOptions: { globals: globals.node },
  },

  {
    rules: {
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Must stay last: turns off rules that conflict with Prettier
  prettier,
]);
