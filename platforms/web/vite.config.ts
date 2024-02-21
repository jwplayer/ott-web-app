import path from 'path';

import { defineConfig, HtmlTagDescriptor } from 'vite';
import type { ConfigEnv, UserConfigExport } from 'vitest/config';
import react from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint';
import StylelintPlugin from 'vite-plugin-stylelint';
import { VitePWA } from 'vite-plugin-pwa';
import { createHtmlPlugin } from 'vite-plugin-html';
import svgr from 'vite-plugin-svgr';
import { viteStaticCopy, type Target } from 'vite-plugin-static-copy';

import { initSettings } from './scripts/build-tools/settings';

export default ({ mode, command }: ConfigEnv): UserConfigExport => {
  // Shorten default mode names to dev / prod
  // Also differentiates from build type (production / development)
  mode = mode === 'development' ? 'dev' : mode;
  mode = mode === 'production' ? 'prod' : mode;

  const localFile = initSettings(mode);

  const app: OTTConfig = {
    name: process.env.APP_NAME || 'JW OTT Webapp',
    shortname: process.env.APP_SHORT_NAME || 'JW OTT',
    description: process.env.APP_DESCRIPTION || 'JW OTT Webapp is an open-source, dynamically generated video website.',
  };

  // Make sure to builds are always production type,
  // otherwise modes other than 'production' get built in dev
  if (command === 'build') {
    process.env.NODE_ENV = 'production';
  }

  const getGoogleScripts = () => {
    const tags: HtmlTagDescriptor[] = [];

    if (process.env.APP_GOOGLE_SITE_VERIFICATION_ID) {
      tags.push({
        tag: 'meta',
        injectTo: 'head',
        attrs: {
          content: process.env.APP_GOOGLE_SITE_VERIFICATION_ID,
          name: 'google-site-verification',
        },
      });
    }
    if (process.env.APP_GTM_TAG_ID) {
      tags.push(
        {
          injectTo: 'head',
          tag: 'script',
          children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${process.env.APP_GTM_TAG_ID}');`,
        },
        {
          injectTo: 'body-prepend',
          tag: 'noscript',
          children: `<iframe src="https://www.googletagmanager.com/ns.html?id=${process.env.APP_GTM_TAG_ID}"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
        },
      );
    }

    return tags;
  };
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
      src: '../../packages/testing/epg/*',
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
          tags: getGoogleScripts(),
          data: app,
        },
      }),
      viteStaticCopy({
        targets: fileCopyTargets,
      }),
    ],
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
      __mode__: JSON.stringify(mode),
      __dev__: process.env.NODE_ENV !== 'production',
    },
    publicDir: './public',
    envPrefix: 'APP_',
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
  });
};
