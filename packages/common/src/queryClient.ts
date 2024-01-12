import { QueryClient } from '@tanstack/query-core';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      retryOnMount: false,
    },
  },
});
