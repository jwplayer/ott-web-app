import 'vi-fetch/setup';
import 'reflect-metadata';
import { mockService } from './test/mockService';
import LogTransporter from './src/services/logging/LogTransporter';
import ConsoleTransporter from './src/services/logging/ConsoleTransporter';
import { LogLevel } from './src/services/logging/LogLevel';

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
    const listeners: Record<string, ((event: { type: string; data: string }) => void)[]> = {};

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

        messageListeners.forEach((listener) => listener({ type: 'message', data: message }));
      },
    };
  }),
);
