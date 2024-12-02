const restrictedGlobals = require('confusing-browser-globals');

module.exports = {
  parser: '@typescript-eslint/parser',

  plugins: [
    // Enable Typescript linting
    '@typescript-eslint',

    // Enable linting imports
    'import',
  ],

  extends: [
    // Use default ESLint rules
    'eslint:recommended',

    // Use recommended TS rules
    'plugin:@typescript-eslint/recommended',

    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],

  env: {
    // Browser conf
    browser: true,
    es6: true,
  },

  rules: {
    // Prevent development/debugging statements
    'no-console': ['error', { allow: ['warn', 'error', 'info', 'debug'] }],
    'no-alert': 'error',
    'no-debugger': 'error',

    // Prevent usage of confusing globals
    'no-restricted-globals': ['error'].concat(restrictedGlobals),

    // Assignments in function returns is confusing and could lead to unwanted side-effects
    'no-return-assign': ['error', 'always'],

    curly: ['error', 'multi-line'],

    'import/no-named-as-default-member': 'off',

    // Strict import ordering
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
        pathGroups: [
          // Sort absolute root imports before parent imports
          {
            pattern: '/**',
            group: 'parent',
            position: 'before',
          },
        ],
        'newlines-between': 'always',
      },
    ],
  },
  overrides: [
    {
      files: ['*.js'],
      env: {
        // We may still use CJS in .js files (eg. local scripts)
        commonjs: true,
      },
      rules: {
        // `require` is still allowed/recommended in JS
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        // These are handled by TS
        '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
        '@typescript-eslint/no-unused-vars': 'off',
        'import/no-unresolved': 'off',
      },
    },
  ],
};
