const stylelintConfig = require('./stylelint.config.js');

module.exports = {
  syntax: 'postcss-scss',
  plugins: [
    require('postcss-import')({
      plugins: [
        require('stylelint')({
          config: stylelintConfig,
        }),
      ],
    }),
  ],
};
