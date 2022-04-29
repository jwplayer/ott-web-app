import { defineConfig } from 'vitest/config'

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  css: {
    modules: {
      generateScopedName: (name) => name
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [
        "test/vitest.setup.ts"
    ]
  },
  resolve: {
    alias: {
      'src': './src',
      'test': './test'
    }
  }
})
