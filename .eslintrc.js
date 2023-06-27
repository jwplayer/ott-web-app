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

    // Use recommended React rules
    'plugin:react/recommended',

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
    // Not needed in React 17
    'react/react-in-jsx-scope': 'off',
    'import/no-named-as-default-member': 'off',
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
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        // TypeScript 4.0 adds 'any' or 'unknown' type annotation on catch clause variables.
        // We need to make sure error is of the type we are expecting
        '@typescript-eslint/no-implicit-any-catch': 'error',

        // These are handled by TS
        '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'import/no-unresolved': 'off',
      },
    },
    {
      files: ['*.jsx', '*.tsx', 'src/hooks/*.ts'],
      plugins: [
        // Enable linting React code
        'react',
        'react-hooks',
      ],
      rules: {
        // Help with Hooks syntax
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',

        // Handled by Typescript
        'react/prop-types': 'off',

        // This rule causes too many false positives, eg. with default exports or child render function
        'react/display-name': 'off',
      },
    },
  ],

  settings: {
    react: {
      pragma: 'React',
      version: '17',
    },
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
};
