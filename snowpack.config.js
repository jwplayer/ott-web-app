/** @type {import("snowpack").SnowpackUserConfig } */
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  alias: {},
  plugins: [
    '@snowpack/plugin-postcss',
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-sass',
    ['@snowpack/plugin-webpack', {
      extendConfig: (config) => {
        const cssModulesRule = config.module.rules.find((rule) =>
          rule && rule.use && rule.use.find((use) => use && use.loader && use.loader.includes('css-loader') && use.options && use.options.modules));

        if (cssModulesRule) {
          cssModulesRule.use.unshift({
            loader:  require.resolve('./scripts/webpack/css-modules-fix.js'),
          });
        }

        config.plugins.push(new WorkboxPlugin.GenerateSW())

        return config;
      },
    }],
    [
      '@snowpack/plugin-typescript',
      {
        ...(process.versions.pnp ? { tsc: 'yarn pnpify tsc' } : {}),
      },
    ],
    [
      '@snowpack/plugin-run-script',
      {
        name: 'eslint',
        cmd: 'eslint src --ext .js,.jsx,.ts,.tsx',
        watch: 'esw -w --clear src --ext .js,.jsx,.ts,.tsx',
      },
    ],
    [
      '@snowpack/plugin-run-script',
      {
        name: 'stylelint',
        cmd: 'stylelint src/**/*.scss',
      },
    ],
  ],
  routes: [{ match: 'routes', src: '.*', dest: '/index.html' }],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
  },
  buildOptions: {
    /* ... */
  },
};
