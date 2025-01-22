const { readdirSync } = require('fs');
const { join } = require('path');

// i18next runs in the workspace root, so we need to make sure the locales path is correct
const localesPath = join(__dirname, '/public/locales');
const localesEntries = readdirSync(localesPath, { withFileTypes: true });
const locales = localesEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

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
  output: join(localesPath, '$LOCALE/$NAMESPACE.json'),
  sort: true,
};
