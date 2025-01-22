import 'vi-fetch/setup';
import 'reflect-metadata';
import { mockService } from '@jwp/ott-common/test/mockService';
import LogTransporter from '@jwp/ott-common/src/services/logging/LogTransporter';
import ConsoleTransporter from '@jwp/ott-common/src/services/logging/ConsoleTransporter';
import { LogLevel } from '@jwp/ott-common/src/services/logging/LogLevel';

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
