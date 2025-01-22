import type { Plugin } from 'vite';

export const legacyBrowserPlugin = (enabled: boolean = true): Plugin => {
  return {
    name: 'legacy-browser',
    resolveId(id) {
      if (id.includes('virtual:polyfills')) {
        return '\0' + id;
      }
    },
    load(id) {
      if (id.includes('\0virtual:polyfills')) {
        return enabled ? "import './src/polyfills';" : 'export default {};';
      }
    },
    config(config) {
      if (enabled) {
        config.build = config.build ?? {};
        config.build.target = ['es2020', 'edge88', 'firefox78', 'chrome68', 'safari14'];
      }
    },
  };
};
