import path from 'path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint';
import StylelintPlugin from 'vite-plugin-stylelint';
import { VitePWA } from 'vite-plugin-pwa';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// noinspection JSUnusedGlobalSymbols
export default ({ mode }: { mode: 'production' | 'development' | 'test' }) => {
  const plugins = [
    react(),
    eslintPlugin({ emitError: mode === 'production' }), // Move linting to pre-build to match dashboard
    StylelintPlugin(),
    VitePWA(),
    createHtmlPlugin({
      minify: true,
    }),
  ];

  // These files are only needed in dev / test, don't include in prod builds
  if (['1', 'true'].includes(process.env.INCLUDE_EPG_DATA?.toLowerCase() || '')) {
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
    },
    css: {
      devSourcemap: true,
    },
    resolve: {
      alias: {
        '#src': path.join(__dirname, 'src'),
        '#test': path.join(__dirname, 'test'),
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
