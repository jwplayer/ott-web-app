import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignoreBinaries: [
    // These are installed, but don't have valid package.json bin fields for knip to detect them
    'stylelint',
  ],
  workspaces: {
    '.': {
      entry: ['scripts/**/*'],
      ignoreDependencies: [
        // Workspace packages
        'eslint-config-jwp',
      ],
      ignoreBinaries: [
        // false positives from yarn scripts in github actions
        'build',
        'global',
        'start:test',
        'codecept:*',
      ],
    },
    'packages/common': {
      entry: ['src/**/*'],
    },
    'packages/ui-react': {
      entry: ['src/**/*'],
      ignoreDependencies: [
        'sass', // Used in css
      ],
    },
    'platforms/web': {
      ignoreDependencies: [
        '@codeceptjs/allure-legacy',
        '@codeceptjs/configure', // Used in e2e tests
        '@babel/plugin-proposal-decorators', // Used to build with decorators for ioc resolution
        '@babel/core', // Required peer dependency for babel plugins
        '@types/luxon', // Used in tests
        'babel-plugin-transform-typescript-metadata', // Used to build with decorators for ioc resolution
        'eslint-plugin-codeceptjs', // Used by apps/web/test-e2e/.eslintrc.cjs
        'luxon', // Used in tests
        'playwright', // Used in test configs
        'sharp', // Requirement for @vite-pwa/assets-generator
        'tsconfig-paths', // Used for e2e test setup
        'virtual:pwa-register', // Service Worker code is injected at build time,
      ],
    },
    'configs/eslint-config-jwp': {
      entry: ['*.*'],
      ignoreDependencies: [
        // Dynamically loaded in the eslint config
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'eslint-plugin-import',
        'eslint-plugin-react',
        'eslint-plugin-react-hooks',
      ],
    },
    'configs/postcss-config-jwp': {
      ignoreDependencies: [
        // Dynamically loaded in the postcss config
        'postcss-scss',
      ],
    },
    'configs/stylelint-config-jwp': {
      ignoreDependencies: [
        // Dynamically loaded in the stylelint config
        'stylelint',
        'stylelint-order',
        'stylelint-config-recommended-scss',
        'stylelint-declaration-strict-value',
        'stylelint-scss',
      ],
    },
  },
};

export default config;
