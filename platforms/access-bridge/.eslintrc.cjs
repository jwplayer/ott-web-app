module.exports = {
  extends: ['jwp/typescript'],
  rules: {
    "max-len": ["error", { "code": 120 }],
    "import/no-unused-modules": ["error"]
  },
  env: {
    node: true, // Enables recognition of Node.js global variables and scoping rules
  },
  ignorePatterns: ['build'],
};

