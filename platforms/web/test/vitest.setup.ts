import 'react-app-polyfill/stable';
import '@testing-library/jest-dom/vitest'; // Including this for the expect extensions
import 'vi-fetch/setup';
import 'reflect-metadata';
import type { ComponentType } from 'react';
import * as matchers from 'vitest-axe/matchers';
import { expect } from 'vitest';
import { mockService } from '@jwp/ott-common/test/mockService';
import LogTransporter from '@jwp/ott-common/src/services/logging/LogTransporter';
import ConsoleTransporter from '@jwp/ott-common/src/services/logging/ConsoleTransporter';
import { LogLevel } from '@jwp/ott-common/src/services/logging/LogLevel';

expect.extend(matchers);

beforeEach(() => {
  mockService(
    LogTransporter,
    __debug__
      ? new ConsoleTransporter(LogLevel.DEBUG)
      : {
          log() {},
        },
  );
});

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

const country = {
  af: 'Afghanistan',
  ax: 'Åland Islands',
  al: 'Albania',
};

const usStates = {
  al: 'Alabama',
  ak: 'Alaska',
  az: 'Arizona',
};

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
        getResourceBundle: (_: string, ns: string) => ({ country, us_state: usStates }[ns]),
      },
    };
  },
}));
