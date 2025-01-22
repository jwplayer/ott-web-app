import { defineConfig, loadEnv, PluginOption } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import type { ConfigEnv, UserConfigExport } from 'vitest/config';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default ({ mode, command }: ConfigEnv): UserConfigExport => {
  const envPrefix = 'APP_';
  const env = loadEnv(mode, process.cwd(), envPrefix);

  // Shorten default mode names to dev / prod
  mode = mode === 'development' ? 'dev' : mode;
  mode = mode === 'production' ? 'prod' : mode;

  // Ensure builds are always production type
  if (command === 'build') {
    process.env.NODE_ENV = 'production';
  }

  // Define the initial plugins array with the Vite Node plugin for Node.js support
  const plugins: PluginOption[] = [
    VitePluginNode({
      adapter: 'express',
      appPath: 'src/main.ts',
      tsCompiler: 'esbuild',
    }),
  ];

  // Conditionally add the Sentry plugin based on the mode and presence of Sentry-related env variables
  if (mode === 'prod' && env.APP_SENTRY_DSN && env.APP_SENTRY_AUTH_TOKEN) {
    plugins.push(
      sentryVitePlugin({
        authToken: env.APP_SENTRY_AUTH_TOKEN,
        org: env.APP_SENTRY_ORG_NAME,
        project: env.APP_SENTRY_PROJ_NAME,
      })
    );
  }

  return defineConfig({
    server: {
      port: parseInt(env.APP_BIND_PORT),
    },
    envPrefix,
    plugins,
    build: {
      outDir: 'build',
      sourcemap: true,
    },
    test: {
      globals: true,
      environment: 'node',
      setupFiles: 'test/vitest.setup.ts',
      testTimeout: 10000,
      chaiConfig: {
        truncateThreshold: 1000,
      },
      // Switching to 'forks' fixes memory allocation issues and ensures worker processes terminate correctly.
      // This is especially useful to avoid errors like SIGSEGV (segmentation faults) during tests.
      // For more details, see: https://vitest.dev/guide/common-errors.html#failed-to-terminate-worker
      pool: 'forks',
    },
  });
};
