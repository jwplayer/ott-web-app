/* eslint-disable */
// noinspection JSUnusedGlobalSymbols

type steps_file = typeof import('./steps_file');

declare namespace CodeceptJS {
  interface SupportObject {
    I: I;
    current: any;
  }
  interface Methods extends Playwright {}
  // @ts-ignore
  interface I extends ReturnType<steps_file> {}
  namespace Translation {
    interface Actions {}
  }
}
