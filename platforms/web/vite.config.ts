import path from 'path';

import { defineConfig, loadEnv } from 'vite';
import type { ConfigEnv, UserConfigExport } from 'vitest/config';
import react from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint';
import StylelintPlugin from 'vite-plugin-stylelint';
import { VitePWA } from 'vite-plugin-pwa';
import { createHtmlPlugin } from 'vite-plugin-html';
import svgr from 'vite-plugin-svgr';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import { basePath, favIconSizes, appleIconSizes } from './pwa-assets.config';
import {
  extractExternalFonts,
  getFileCopyTargets,
  getGoogleFontTags,
  getGoogleVerificationTag,
  getGtmTags,
  generateIconTags,
} from './scripts/build-tools/buildTools';

export default ({ mode, command }: ConfigEnv): UserConfigExport => {
  const envPrefix = 'APP_';
  const env = loadEnv(mode, process.cwd(), envPrefix);

  // Shorten default mode names to dev / prod
  // Also differentiates from build type (production / development)
  mode = mode === 'development' ? 'dev' : mode;
  mode = mode === 'production' ? 'prod' : mode;

  // Make sure to builds are always production type,
  // otherwise modes other than 'production' get built in dev
  if (command === 'build') {
    process.env.NODE_ENV = 'production';
  }

  const app: OTTConfig = {
    name: process.env.APP_NAME || 'JW OTT Webapp',
    shortname: process.env.APP_SHORT_NAME || 'JW OTT',
    description: process.env.APP_DESCRIPTION || 'JW OTT Webapp is an open-source, dynamically generated video website.',
  };

  const bodyFonts = extractExternalFonts(env.APP_BODY_FONT_FAMILY);
  const bodyAltFonts = extractExternalFonts(env.APP_BODY_ALT_FONT_FAMILY);

  const fontTags = getGoogleFontTags([bodyFonts, bodyAltFonts].flat());
  const bodyFontsString = bodyFonts.map((font) => font.fontFamily).join(', ');
  const bodyAltFontsString = bodyAltFonts.map((font) => font.fontFamily).join(', ');
  const favicons = generateIconTags(basePath, favIconSizes, appleIconSizes);

  return defineConfig({
    plugins: [
      react({
        // This is needed to do decorator transforms for ioc resolution to work for classes
        babel: { plugins: ['babel-plugin-transform-typescript-metadata', ['@babel/plugin-proposal-decorators', { legacy: true }]] },
      }),
      eslintPlugin({ emitError: mode === 'production' || mode === 'demo' || mode === 'preview' }), // Move linting to pre-build to match dashboard
      StylelintPlugin(),
      svgr(),
      VitePWA({
        manifestFilename: 'manifest.json',
        manifest: {
          name: app.name,
          description: app.description,
          short_name: app.shortname,
          display: 'standalone',
          start_url: '/',
          theme_color: '#DD0000',
          orientation: 'any',
          background_color: '#000',
          related_applications: [],
          prefer_related_applications: false,
          icons: [
            {
              src: 'images/icons/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'images/icons/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
      createHtmlPlugin({
        minify: true,
        inject: {
          tags: [getGoogleVerificationTag(env), fontTags, getGtmTags(env)].flat(),
          data: { ...app, favicons },
        },
      }),
      viteStaticCopy({ targets: getFileCopyTargets(mode) }),
    ],
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
      __mode__: JSON.stringify(mode),
      __dev__: process.env.NODE_ENV !== 'production',
      'import.meta.env.APP_BODY_FONT': JSON.stringify(bodyFontsString),
      'import.meta.env.APP_BODY_ALT_FONT': JSON.stringify(bodyAltFontsString),
    },
    publicDir: './public',
    envPrefix,
    server: {
      port: 8080,
    },
    mode: mode,
    assetsInclude: mode === 'test' ? ['**/*.xml'] : [],
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
        // '~' is used for absolute (S)CSS imports to prevent losing the auto naming function
        '~': path.join(__dirname, 'src'),
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
    optimizeDeps: {
      esbuildOptions: {
        tsconfig: 'tsconfig.json',
      },
    },
  });
};
