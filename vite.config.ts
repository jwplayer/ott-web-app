import path from 'path';

import { defineConfig } from 'vite';
import type { ConfigEnv, UserConfigExport } from 'vitest/config';
import react from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint';
import StylelintPlugin from 'vite-plugin-stylelint';
import { VitePWA } from 'vite-plugin-pwa';
import { createHtmlPlugin } from 'vite-plugin-html';
import { Target, viteStaticCopy } from 'vite-plugin-static-copy';

import { initSettings } from './scripts/build-tools/settings';

export default ({ mode, command }: ConfigEnv): UserConfigExport => {
  // Shorten default mode names to dev / prod
  // Also differentiates from build type (production / development)
  mode = mode === 'development' ? 'dev' : mode;
  mode = mode === 'production' ? 'prod' : mode;

  const localFile = initSettings(mode);

  // Make sure to builds are always production type,
  // otherwise modes other than 'production' get built in dev
  if (command === 'build') {
    process.env.NODE_ENV = 'production';
  }

  const fileCopyTargets: Target[] = [
    {
      src: localFile,
      dest: '',
      rename: '.webapp.ini',
    },
  ];

  // These files are only needed in dev / test / demo, so don't include in prod builds
  if (mode !== 'prod') {
    fileCopyTargets.push({
      src: 'test/epg/*',
      dest: 'epg',
    });
  }

  return defineConfig({
    plugins: [
      react({
        // This is needed to do decorator transforms for ioc resolution to work for classes
        babel: {
          plugins: [
            // Seems like this one isn't needed anymore, but leaving in case we run into a bug later
            // 'babel-plugin-parameter-decorator',
            'babel-plugin-transform-typescript-metadata',
            ['@babel/plugin-proposal-decorators', { legacy: true }],
          ],
        },
      }),
      eslintPlugin({ emitError: mode === 'production' || mode === 'demo' || mode === 'preview' }), // Move linting to pre-build to match dashboard
      StylelintPlugin(),
      VitePWA(),
      createHtmlPlugin({
        minify: true,
        inject: process.env.APP_GOOGLE_SITE_VERIFICATION_ID
          ? {
              tags: [
                {
                  tag: 'meta',
                  injectTo: 'head',
                  attrs: {
                    content: process.env.APP_GOOGLE_SITE_VERIFICATION_ID,
                    name: 'google-site-verification',
                  },
                },
              ],
            }
          : {},
      }),
      viteStaticCopy({
        targets: fileCopyTargets,
      }),
    ],
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
    },
    publicDir: './public',
    envPrefix: 'APP_',
    server: {
      port: 8080,
    },
    mode: mode,
    build: {
      outDir: './build/public',
      cssCodeSplit: false,
      sourcemap: true,
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
            if (id.includes('/node_modules/@inplayer')) {
              return 'inplayer';
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
