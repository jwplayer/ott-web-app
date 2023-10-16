/* eslint-disable no-console */
import fs from 'fs';

import ini from 'ini';

const OTT_GLOBAL_PLAYER_ID = 'M4qoGvUk';

export const initSettings = (mode: string) => {
  const localFile = `ini/.webapp.${mode}.ini`;
  const templateFile = `ini/templates/.webapp.${mode}.ini`;

  // The build ONLY uses .ini files in /ini to include in the build output.
  // All .ini files in the directory are git ignored to customer specific values out of source control.
  // However, this script will automatically create a .ini file for the current mode if it doesn't exist
  // by copying the corresponding mode file from the ini/templates directory.
  if (!fs.existsSync(localFile) && fs.existsSync(templateFile)) {
    fs.copyFileSync(templateFile, localFile);
  }

  let settings: Record<string, string | undefined>;

  try {
    const data = fs.readFileSync(`ini/.webapp.${mode}.ini`, 'utf8');
    settings = ini.parse(data);
  } catch (err: unknown) {
    settings = {};
  }
  const { defaultConfigSource, additionalAllowedConfigSources, playerId, playerLicenseKey, UNSAFE_allowAnyConfigSource } = settings;

  // The ini file values will be used if provided, even if compile-time values are set
  process.env.APP_DEFAULT_CONFIG_SOURCE = defaultConfigSource || process.env.APP_DEFAULT_CONFIG_SOURCE || '';
  process.env.APP_PLAYER_ID = playerId || process.env.APP_PLAYER_ID || OTT_GLOBAL_PLAYER_ID || '';
  process.env.APP_PLAYER_LICENSE_KEY = playerLicenseKey || process.env.APP_PLAYER_LICENSE_KEY || '';
  process.env.APP_ADDITIONAL_ALLOWED_CONFIG_SOURCES = additionalAllowedConfigSources || '';
  process.env.APP_UNSAFE_ALLOW_ANY_CONFIG_SOURCE = UNSAFE_allowAnyConfigSource || '';

  const { APP_PLAYER_ID, APP_PLAYER_LICENSE_KEY, APP_DEFAULT_CONFIG_SOURCE, APP_ADDITIONAL_ALLOWED_CONFIG_SOURCES, APP_UNSAFE_ALLOW_ANY_CONFIG_SOURCE } =
    process.env;

  // The player key should be set if using the global ott player
  if (APP_PLAYER_ID === OTT_GLOBAL_PLAYER_ID && !APP_PLAYER_LICENSE_KEY) {
    console.warn('Using Global OTT Player without setting player key. Some features, such as analytics, may not work correctly.');
  }

  // This will result in an unusable app
  if (
    !APP_DEFAULT_CONFIG_SOURCE &&
    (!APP_DEFAULT_CONFIG_SOURCE || APP_ADDITIONAL_ALLOWED_CONFIG_SOURCES?.length === 0) &&
    !APP_UNSAFE_ALLOW_ANY_CONFIG_SOURCE
  ) {
    throw new Error('No usable config sources');
  }

  console.log('\x1b[36m', '-----------------------------------------------\n');
  console.log('\x1b[32m', 'Variables initialized: ', '\n');
  console.info('APP_DEFAULT_CONFIG_SOURCE: ', APP_DEFAULT_CONFIG_SOURCE);
  console.info('APP_PLAYER_ID: ', APP_PLAYER_ID);
  console.info('APP_PLAYER_LICENSE_KEY: ', APP_PLAYER_LICENSE_KEY);
  console.info('APP_ADDITIONAL_ALLOWED_CONFIG_SOURCES: ', APP_ADDITIONAL_ALLOWED_CONFIG_SOURCES);
  console.info('APP_UNSAFE_ALLOW_ANY_CONFIG_SOURCE: ', APP_UNSAFE_ALLOW_ANY_CONFIG_SOURCE, '\n');
  console.log('\x1b[36m', '-----------------------------------------------\n');
};
