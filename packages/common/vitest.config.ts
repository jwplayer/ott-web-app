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
  },
});
