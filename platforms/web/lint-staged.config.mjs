export default {
  '*.{js,ts,jsx,tsx}': ['eslint --fix', 'prettier --write', 'vitest related --run'],
  '*.scss': ['stylelint --fix'],
  '*.{ts,tsx}': [() => 'tsc --pretty --noEmit'],
};
