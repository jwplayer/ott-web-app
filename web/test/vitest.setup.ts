import 'react-app-polyfill/stable';
import '@testing-library/jest-dom'; // Including this for the expect extensions
import 'vi-fetch/setup';
import 'reflect-metadata';

// a really simple BroadcastChannel stub. Normally, a Broadcast channel would not call event listeners on the same
// instance. But for testing purposes, that really doesn't matter...
vi.stubGlobal(
  'BroadcastChannel',
  vi.fn().mockImplementation(() => {
    const listeners: Record<string, ((event: MessageEvent<string>) => void)[]> = {};

    return {
      close: () => undefined,
      addEventListener: (type: string, listener: () => void) => {
        listeners[type] = listeners[type] || [];
        listeners[type].push(listener);
      },
      removeEventListener: (type: string, listener: () => void) => {
        listeners[type] = listeners[type] || [];
        listeners[type] = listeners[type].filter((current) => current !== listener);
      },
      postMessage: (message: string) => {
        const messageListeners = listeners['message'] || [];

        messageListeners.forEach((listener) => listener(new MessageEvent('message', { data: message })));
      },
    };
  }),
);

vi.mock('#src/i18n/config', () => ({
  getSupportedLanguages: () => [{ code: 'en', displayName: 'English' }],
  default: {
    t: (str: string) => str,
  },
}));
