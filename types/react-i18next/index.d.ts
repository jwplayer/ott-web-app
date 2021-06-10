// import the original type declarations
import 'react-i18next';
// import all namespaces (for the default language, only)
import { resources } from '../../src/i18n/config';

declare module 'react-i18next' {
  // and extend them!
  type DefaultResources = typeof resources['en-US'];
  interface Resources extends DefaultResources {}
}
