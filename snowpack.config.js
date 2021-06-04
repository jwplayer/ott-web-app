/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  alias: {
    '@components': './src/components',
    '@container': './src/container',
    '@types': './src/types',
    '@app': './src',
  },
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
