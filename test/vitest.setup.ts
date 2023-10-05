import type { ComponentType } from 'react';
import 'react-app-polyfill/stable';
import '@testing-library/jest-dom'; // Including this for the expect extensions
import 'vi-fetch/setup';

vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
);

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

// Mock the translation infra
// noinspection JSUnusedGlobalSymbols
vi.mock('react-i18next', () => ({
  default: () => ({
    t: (str: string) => str,
  }),
  // this mock makes sure any components using the translate HoC receive the t function as a prop
  withTranslation: () => (Component: ComponentType) => {
    Component.defaultProps = { ...Component.defaultProps, t: () => '' };
    return Component;
  },
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    // noinspection JSUnusedGlobalSymbols
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () =>
          new Promise(() => {
            /* */
          }),
      },
    };
  },
}));

vi.mock('#src/i18n/config', () => ({
  getSupportedLanguages: () => [{ code: 'en', displayName: 'English' }],
  default: {
    t: (str: string) => str,
  },
}));
