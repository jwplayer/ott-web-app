import { BrowserRouter as Router } from 'react-router-dom';
import React, { ReactNode, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

interface WrapperProps {
  children?: ReactNode;
}

export const wrapper = ({ children }: WrapperProps) => (
  <Router>{children}</Router>
);

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper, ...options });

export const mockWindowLocation = (path: string) => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: path,
      assign: jest.fn(),
    },
  });
};

export { customRender as render };
