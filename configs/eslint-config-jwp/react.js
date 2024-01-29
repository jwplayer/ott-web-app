module.exports = {
  extends: [
    // Extend the base config
    './typescript',

    // Use recommended React rules
    'plugin:react/recommended',
  ],

  rules: {
    // Not needed in React 17
    'react/react-in-jsx-scope': 'off',
  },

  overrides: [
    {
      files: ['*.jsx', '*.tsx', '*.ts'],
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

        // This rule causes too many false positives, e.g. with default exports or child render function
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
