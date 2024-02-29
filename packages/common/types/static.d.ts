// @todo: should not be necessary in the common package
declare module '*.png' {
  const ref: string;
  export default ref;
}

declare module '*.xml' {
  const ref: string;
  export default ref;
}

declare module '*.xml?raw' {
  const raw: string;
  export default raw;
}

declare const __mode__: string;
declare const __dev__: boolean;
