# OTT I18n

This package is currently unused. We have plans to move all translations files from the `../../web/public/locales` 
folder here to make it easier to re-use the translations.

The challenge here is that the web platform loads the translations via i18next-http-backend. We need to find a way to 
sync the translations files without losing too much functionality. 

## RFC

- Move translations files to this package
- Move resources (list of namespaces) file to this package
- No Typescript/Vite/React/i18next dependencies
- Scan platforms and packages for translation keys using i18next-parser

### Impediments

- Loading translations using i18next-http-backend
- Combining translations keys can create conflicts between platforms 
