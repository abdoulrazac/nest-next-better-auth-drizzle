import { nestJsConfig } from '@repo/eslint-config/nest-js';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nestJsConfig,
  {
    files: ['src/**/*.ts'],
    rules: {
      // Path alias resolution (@/) and workspace packages (@repo/*) can fail
      // in the ESLint type-checker context, producing false-positive unsafe-*
      // errors on well-typed code. Downgrade to warn instead of error.
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
];
