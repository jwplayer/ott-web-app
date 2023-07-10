import ini from 'ini';

import { Settings, useSettingsStore } from '#src/stores/SettingsStore';
import { logDev } from '#src/utils/common';
import { OTT_GLOBAL_PLAYER_ID } from '#src/config';

export const initSettings = async () => {
  const settings = await fetch('/.webapp.ini')
    .then((result) => result.text())
    .then((iniString) => ini.parse(iniString) as Settings)
    .catch((e) => {
      logDev(e);
      // It's possible to not use the ini settings files, so an error doesn't have to be fatal
      return {} as Settings;
    });

  if (!settings) {
    throw new Error('Unable to load .webapp.ini');
  }

  // The ini file values will be used if provided, even if compile-time values are set
  settings.defaultConfigSource ||= import.meta.env.APP_DEFAULT_CONFIG_SOURCE;
  settings.playerId ||= import.meta.env.APP_PLAYER_ID || OTT_GLOBAL_PLAYER_ID;
  settings.playerLicenseKey ||= import.meta.env.APP_PLAYER_LICENSE_KEY;

  // The player key should be set if using the global ott player
  if (settings.playerId === OTT_GLOBAL_PLAYER_ID && !settings.playerLicenseKey) {
    console.warn('Using Global OTT Player without setting player key. Some features, such as analytics, may not work correctly.');
  }

  // This will result in an unusable app
  if (
    !settings.defaultConfigSource &&
    (!settings.additionalAllowedConfigSources || settings.additionalAllowedConfigSources?.length === 0) &&
    !settings.UNSAFE_allowAnyConfigSource
  ) {
    throw new Error('No usable config sources');
  }

  useSettingsStore.setState(settings);

  return settings;
};
