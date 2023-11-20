const stylelintConfig = require('stylelint-config-jwp');

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
