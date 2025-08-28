import type { LogLevel } from './LogLevel';

export default abstract class LogTransporter {
  abstract log(level: LogLevel, scope: string, message: string, extra?: Record<string, unknown>, error?: Error): void;
}
