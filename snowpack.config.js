/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  plugins: [
    "@snowpack/plugin-postcss",
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    "@snowpack/plugin-sass",
    [
      '@snowpack/plugin-typescript',
      {
        ...(process.versions.pnp ? { tsc: 'yarn pnpify tsc' } : {}),
      },
    ],
    ["@snowpack/plugin-run-script", {
      "cmd": "eslint src --ext .js,.jsx,.ts,.tsx",
      "watch": "esw -w --clear src --ext .js,.jsx,.ts,.tsx"
    }],
    ["@snowpack/plugin-build-script", {"cmd": "postcss", "input": [".css", ".scss"], "output": [".css"]}]
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
