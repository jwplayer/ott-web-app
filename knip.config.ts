import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: ['scripts/**/*'],
      ignoreBinaries: [
        // false positives from pnpm scripts in github actions
        'build',
      ],
    },
    'packages/common': {
      entry: ['src/**/*'],
      ignoreDependencies: [
        '@jwp/ott-common', // Self-reference so internal `@jwp/ott-common/*` imports resolve under strict pnpm
      ],
    },
    'packages/hooks-react': {
      entry: ['src/**/*'],
      ignoreDependencies: [
        '@jwp/ott-hooks-react', // Self-reference so internal `@jwp/ott-hooks-react/*` imports resolve under strict pnpm
      ],
    },
    'packages/ui-react': {
      entry: ['src/**/*'],
      ignoreUnresolved: ['@jwp/ott-ui-react/src/styles/.*'],
      ignoreDependencies: [
        '@types/dompurify', // Somehow this is not recognised
        'sass-embedded', // Used in Vite
        'postcss-config-jwp', // Used in postcss.config
        '@jwp/ott-ui-react', // Self-reference so internal `@jwp/ott-ui-react/*` imports resolve under strict pnpm
      ],
    },
    'platforms/web': {
      ignoreUnresolved: ['@jwp/ott-ui-react/src/styles/.*'],
      ignoreDependencies: [
        '@codeceptjs/allure-legacy',
        '@codeceptjs/configure', // Used in e2e tests
        '@jwp/ott-testing', // Used in e2e testing
        '@types/luxon', // Used in tests
        'core-js', // Conditionally imported at build time
        'eslint-plugin-codeceptjs', // Used by apps/web/test-e2e/.eslintrc.cjs
        'i18next-parser',
        'luxon', // Used in tests
        'playwright', // Used in test configs
        'tsconfig-paths', // Used for e2e test setup
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
