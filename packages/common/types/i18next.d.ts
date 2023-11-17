import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    // This fixes the `DefaultTFuncReturn` type issues when using `t()` without defining resources here.
    // I've tried defining the resources here, but this causes "Excessively deep and possibility infinite TS errors".
    // See: https://github.com/i18next/react-i18next/issues/1601
    returnNull: false;
  }
}
