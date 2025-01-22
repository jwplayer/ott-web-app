module.exports = {
  // Lint and format JavaScript and TypeScript files
  '*.{js,ts}': ['eslint --fix', 'prettier --write'],

  // Type check TypeScript files
  '*.ts': [() => 'tsc --pretty --noEmit'],
};
