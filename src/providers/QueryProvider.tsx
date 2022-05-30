import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      retryOnMount: false,
    },
  },
});

type QueryProviderProps = {
  children: JSX.Element;
};

function QueryProvider({ children }: QueryProviderProps): JSX.Element {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default QueryProvider;
