import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import React, { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { act } from '@testing-library/react';

interface WrapperProps {
  children?: ReactNode;
}

function Router({ children }: WrapperProps) {
  const routes = createRoutesFromElements(<Route path="*" element={<>{children}</>} />);

  return <RouterProvider router={createBrowserRouter(routes, { window })} />;
}

export const createWrapper = () => {
  const client = new QueryClient();

  return ({ children }: WrapperProps) => (
    <QueryClientProvider client={client}>
      <Router>{children as ReactElement}</Router>
    </QueryClientProvider>
  );
};

// native 'waitFor' uses 'setInterval' under the hood which is also faked when using vi.useFakeTimers...
// this custom method is to trigger micro task queue and wait for updates
export const waitForWithFakeTimers = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
