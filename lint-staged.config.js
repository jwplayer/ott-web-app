module.exports = {
  '{**/*,*}.{js,ts,jsx,tsx}': ['eslint --fix', 'prettier --write'],
  '{web,packages/ui-react}/src/**/*.scss': ['stylelint --fix'],
  // '{**/*,*}.{ts,tsx}': [() => 'tsc --pretty --noEmit'], // this doesn't work with multiple projects
};
