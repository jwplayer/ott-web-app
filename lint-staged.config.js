module.exports = {
  '{**/*,*}.{js,ts,jsx,tsx}': ['eslint --fix', 'prettier --write'],
  'src/**/*.scss': ['stylelint --fix'],
  '{**/*,*}.{ts,tsx}': [() => 'tsc --pretty --noEmit'],
};
