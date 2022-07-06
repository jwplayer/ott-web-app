// i18next-parser.config.js

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
  locales: ['en_US', 'nl_NL'],
  namespaceSeparator: ':',
  output: 'src/i18n/locales/$LOCALE/$NAMESPACE.json',
  sort: true,
};
