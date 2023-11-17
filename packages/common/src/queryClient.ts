import { QueryClient } from 'react-query';

// @TODO: replace with `@tanstack/query-core` to remove React dependency
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      retryOnMount: false,
    },
  },
});
