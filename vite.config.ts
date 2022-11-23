import path from 'path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint';
import StylelintPlugin from 'vite-plugin-stylelint';
import { VitePWA } from 'vite-plugin-pwa';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default ({ mode, command }: { mode: string; command: string }) => {
  // Make sure to builds are always production type,
  // otherwise modes other than 'production' get built in dev
  if (command === 'build') {
    process.env.NODE_ENV = 'production';
  }

  const plugins = [
    react(),
    eslintPlugin({ emitError: mode === 'production' || mode === 'demo' }), // Move linting to pre-build to match dashboard
    StylelintPlugin(),
    VitePWA(),
    createHtmlPlugin({
      minify: true,
    }),
  ];

  // These files are only needed in dev / test / demo, so don't include in prod builds
  if (mode !== 'prod' && mode !== 'production') {
    plugins.push(
      viteStaticCopy({
        targets: [
          {
            src: 'test/epg/*',
            dest: 'epg',
          },
        ],
      }),
    );
  }

  return defineConfig({
    plugins: plugins,
    publicDir: './public',
    envPrefix: 'APP_',
    server: {
      port: 8080,
    },
    build: {
      outDir: './build/public',
      cssCodeSplit: false,
      minify: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // I originally just wanted to separate react-dom as its own bundle,
            // but you get an error at runtime without these dependencies
            if (
              id.includes('/node_modules/react-dom/') ||
              id.includes('/node_modules/scheduler/') ||
              id.includes('/node_modules/object-assign/') ||
              id.includes('/node_modules/react/')
            ) {
              return 'react';
            }

            if (id.includes('/node_modules/')) {
              return 'vendor';
            }

            return 'index';
          },
        },
      },
    },
    css: {
      devSourcemap: true,
    },
    resolve: {
      alias: {
        '#src': path.join(__dirname, 'src'),
        '#components': path.join(__dirname, 'src/components'),
        '#test': path.join(__dirname, 'test'),
        '#test-e2e': path.join(__dirname, 'test-e2e'),
        '#types': path.join(__dirname, 'types'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['test/vitest.setup.ts'],
      css: true,
    },
  });
};
