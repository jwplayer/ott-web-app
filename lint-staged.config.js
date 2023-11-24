module.exports = {
  'scripts/{**/*,*}.{js,ts,jsx,tsx}': ['eslint --fix', 'prettier --write'],
  'scripts/{**/*,*}.{ts,tsx}': [() => 'tsc --pretty --noEmit -p ./scripts'],
};
