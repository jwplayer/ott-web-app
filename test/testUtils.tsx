import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import React, { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, RenderOptions } from '@testing-library/react';

import QueryProvider from '#src/containers/QueryProvider/QueryProvider';

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

export const wrapper = ({ children }: WrapperProps) => (
  <QueryProvider>
    <Router>{children as ReactElement}</Router>
  </QueryProvider>
);

const customRender = (ui: ReactElement, options?: RenderOptions) => render(ui, { wrapper, ...options });

export const mockWindowLocation = (path: string) => {
  vi.stubGlobal('location', {
    pathname: path,
    assign: vi.fn(),
  });
};

export { customRender as renderWithRouter };
