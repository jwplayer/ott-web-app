const fs = require('fs');

// @TODO: make it work with all packages and the web platform
const localesEntries = fs.readdirSync('./platforms/web/public/locales');
const locales = localesEntries.filter((entry) => entry !== '..' && entry !== '.');

module.exports = {
  contextSeparator: '_',
  createOldCatalogs: true,
  defaultNamespace: 'common',
  defaultValue: '',
  indentation: 2,
  keepRemoved: false,
  keySeparator: '.',
  lexers: {
    mjs: ['JavascriptLexer'],
    js: ['JavascriptLexer'],
    ts: ['JavascriptLexer'],
    jsx: ['JsxLexer'],
    tsx: ['JsxLexer'],
    default: ['JavascriptLexer'],
  },
  lineEnding: 'auto',
  locales,
  namespaceSeparator: ':',
  output: 'platforms/web/public/locales/$LOCALE/$NAMESPACE.json',
  sort: true,
};
