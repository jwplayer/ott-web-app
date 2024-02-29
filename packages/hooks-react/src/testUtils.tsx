import React, { type ReactElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { act } from '@testing-library/react';

interface WrapperProps {
  children?: ReactNode;
}

export const queryClientWrapper = () => {
  const client = new QueryClient();

  return ({ children }: WrapperProps) => <QueryClientProvider client={client}>{children as ReactElement}</QueryClientProvider>;
};

// native 'waitFor' uses 'setInterval' under the hood which is also faked when using vi.useFakeTimers...
// this custom method is to trigger micro task queue and wait for updates
export const waitForWithFakeTimers = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
