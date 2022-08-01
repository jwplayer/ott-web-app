import { BrowserRouter as Router } from 'react-router-dom';
import React, { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, RenderOptions } from '@testing-library/react';

import QueryProvider from '../src/providers/QueryProvider';

interface WrapperProps {
  children?: ReactNode;
}

export const createWrapper = () => {
  const client = new QueryClient();

  return ({ children }: WrapperProps) => (
    <Router>
      <QueryClientProvider client={client}>{children as ReactElement}</QueryClientProvider>
    </Router>
  );
};

export const wrapper = ({ children }: WrapperProps) => (
  <Router>
    <QueryProvider>{children as ReactElement}</QueryProvider>
  </Router>
);

const customRender = (ui: ReactElement, options?: RenderOptions) => render(ui, { wrapper, ...options });

export const mockWindowLocation = (path: string) => {
  vi.stubGlobal('location', {
    pathname: path,
    assign: vi.fn(),
  });
};

export { customRender as renderWithRouter };
