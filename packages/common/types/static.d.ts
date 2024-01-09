// @todo: should not be necessary in the common package
declare module '*.png' {
  const ref: string;
  export default ref;
}

declare const __mode__: string;
declare const __dev__: boolean;
