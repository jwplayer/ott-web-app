const WorkboxPlugin = require('workbox-webpack-plugin');
const webpack = require('webpack');

require('./scripts/_dotenv');
const CompressionPlugin = require("compression-webpack-plugin");
const zlib = require("zlib");

module.exports = {
  mount: Object.assign({
        public: { url: '/', static: true },
        src: { url: '/dist' },
      // Only include the test-data directory in non-production builds
      }, process.env.NODE_ENV === 'production' ? {} : {'test-e2e/data': {url: '/test-data'}}
  ),
  alias: {},
  plugins: [
    '@snowpack/plugin-postcss',
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-sass',
    ['@snowpack/plugin-webpack', {
    
      extendConfig: (config) => {
        // FIXES https://github.com/snowpackjs/snowpack/discussions/2810
        const babelRule = config.module.rules.find((rule) =>
          rule && rule.use && rule.use.find((use) => use && use.loader && use.loader.includes('babel-loader')));

        const cssModulesRule = config.module.rules.find((rule) =>
          rule && rule.use && rule.use.find((use) => use && use.loader && use.loader.includes('css-loader') && use.options && use.options.modules));

        if (cssModulesRule) {
          cssModulesRule.use.unshift({
            loader:  require.resolve('./scripts/webpack/css-modules-fix.js'),
          });
        }

        if (babelRule) {
          babelRule.use = babelRule.use.filter(use => {
            if (use.loader.includes('babel-loader')) {
              use.options.plugins = (use.options.plugins || []).concat([
                '@babel/plugin-proposal-optional-chaining',
                '@babel/plugin-proposal-nullish-coalescing-operator'
              ]);
            }

            return true;
          });
        }

        config.plugins.push(new WorkboxPlugin.GenerateSW())
        // Need to add double quotes in the string since this value gets substituted raw at compile time
        config.plugins.push(new webpack.DefinePlugin({
          NODE_ENV_COMPILE_CONST: `"${process.env.NODE_ENV}"` || '"production"',
        }))

        config.plugins.push(
          new CompressionPlugin({
            filename: "[path][base].br",
            algorithm: "brotliCompress",
            test: /\.(js|css|html|svg)$/,
            compressionOptions: {
              params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
              },
            },
            threshold: 10240,
            minRatio: 0.8,
            deleteOriginalAssets: false,
          })
        );

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
    baseUrl: process.env.SNOWPACK_PUBLIC_BASE_URL || '',
  },
};
