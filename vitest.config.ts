import { defineConfig } from 'vitest/config';

// This file is used by vitest for running tests for multiple packages in monorepos
// See more at https://vitest.dev/guide/projects
export default defineConfig({
  test: {
    projects: ['packages/*/vitest.config.ts', 'platforms/*'],
  },
});
