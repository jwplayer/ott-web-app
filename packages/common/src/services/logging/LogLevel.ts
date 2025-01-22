export enum LogLevel {
  // detailed information for diagnosing problems, typically only useful during development
  DEBUG,
  // general information about the application's operation, such as startup or shutdown messages
  INFO,
  // indications of potential problems or unusual situations that are not immediately harmful
  WARN,
  // errors that affect the functionality of the application but allow it to continue running
  ERROR,
  // severe errors that lead to the application's termination
  FATAL,
  // no logging will be performed. Used to disable logging completely
  SILENT,
}
