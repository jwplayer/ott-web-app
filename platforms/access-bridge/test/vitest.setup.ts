import { vi } from 'vitest';
import * as Sentry from '@sentry/node';

// Mock sentry lib
vi.mock('@sentry/node', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof Sentry;

  return {
    ...actual,
    init: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    getClient: vi.fn(),
  };
});

beforeEach(() => {
  // Clear all mocks
  vi.clearAllMocks();
});
