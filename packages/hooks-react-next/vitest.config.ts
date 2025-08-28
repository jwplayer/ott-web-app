import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['vitest.setup.ts'],
    css: true,
  },
  define: {
    __mode__: '"test"',
    __dev__: true,
    __debug__: process.env.APP_TEST_DEBUG === '1',
  },
});
