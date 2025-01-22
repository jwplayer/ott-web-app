import React, { act, type ReactElement, type ReactNode } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, type RenderOptions } from '@testing-library/react';

import QueryProvider from '../src/containers/QueryProvider/QueryProvider';
import { AriaAnnouncerProvider } from '../src/containers/AnnouncementProvider/AnnoucementProvider';

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
    <AriaAnnouncerProvider>
      <Router>{children as ReactElement}</Router>
    </AriaAnnouncerProvider>
  </QueryProvider>
);

const customRender = (ui: ReactElement, options?: RenderOptions) => render(ui, { wrapper, ...options });

export const mockWindowLocation = (path: string) => {
  const location = new URL(`https://www.jwplayer.com/${path}`) as unknown as Location;
  globalThis.location = location;
};

export { customRender as renderWithRouter };

// native 'waitFor' uses 'setInterval' under the hood which is also faked when using vi.useFakeTimers...
// this custom method is to trigger micro task queue and wait for updates
export const waitForWithFakeTimers = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
