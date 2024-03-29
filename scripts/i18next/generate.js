/**
 * This script generates all i18next resource entries.
 */
const fs = require('fs');
const path = require('path');

const prettier = require('prettier');

const localesPath = './platforms/web/public/locales';
const defaultLocale = 'en';
const resourcesPath = './platforms/web/src/i18n/resources.ts';

// filter *_old namespaces generated by i18next-parser
const namespaces = fs
  .readdirSync(path.join(localesPath, defaultLocale))
  .filter((namespace) => !/_old\.json/.test(namespace))
  .map((namespace) => namespace.replace('.json', ''));

let configContents = `// This file is generated, do not modify manually.
// Run \`$ yarn i18next\` to update this file

export const NAMESPACES = ${JSON.stringify(namespaces)};`;

prettier.resolveConfig('./prettierrc').then((options) => {
  const formatted = prettier.format(configContents, { ...options, filepath: resourcesPath });

  fs.writeFileSync(resourcesPath, formatted, { encoding: 'utf-8' });

  console.info('');
  console.info(`Generated i18next resources for all namespaces`);
  console.info('');
});
