import { getAllModules } from './modules/container';
import { LogLevel } from './services/logging/LogLevel';
import LogTransporter from './services/logging/LogTransporter';

export type LogParams = { error?: unknown; [key: string]: unknown };

const wrapError = (error: unknown) => {
  return error instanceof Error ? error : new Error(String(error));
};

export const makeLogFn =
  (logLevel: LogLevel) =>
  (scope: string, message: string, { error, ...extra }: LogParams = {}) => {
    const transporters = getAllModules(LogTransporter);

    // call log on all transporters, the transporters should decide to handle the call or not
    transporters.forEach((transporter) => {
      transporter.log(logLevel, scope, message, extra, error ? wrapError(error) : undefined);
    });
  };

export const logDebug = makeLogFn(LogLevel.DEBUG);
export const logInfo = makeLogFn(LogLevel.INFO);
export const logWarn = makeLogFn(LogLevel.WARN);
export const logError = makeLogFn(LogLevel.ERROR);
export const logFatal = makeLogFn(LogLevel.FATAL);
