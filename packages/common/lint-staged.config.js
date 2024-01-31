module.exports = {
  '*.{js,ts,jsx,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{ts,tsx}': [() => 'tsc --pretty --noEmit'],
};
