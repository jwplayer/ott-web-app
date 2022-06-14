import { BrowserRouter as Router } from 'react-router-dom';
import React, { ReactNode, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

import QueryProvider from '../src/providers/QueryProvider';

interface WrapperProps {
  children?: ReactNode;
}

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
