const {
  transform,
  ...rest
} = require('@snowpack/app-scripts-react/jest.config.js')();

module.exports = {
  transform: {
    '.+\\.(css|styl|less|sass|scss)$': 'jest-css-modules-transform',
    ...transform,
  },
  ...rest,
};
