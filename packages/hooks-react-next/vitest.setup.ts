import 'vi-fetch/setup';
import 'reflect-metadata';
import { mockService } from '@jwp/ott-common-next/test/mockService';
import LogTransporter from '@jwp/ott-common-next/src/services/logging/LogTransporter';
import ConsoleTransporter from '@jwp/ott-common-next/src/services/logging/ConsoleTransporter';
import { LogLevel } from '@jwp/ott-common-next/src/services/logging/LogLevel';

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
