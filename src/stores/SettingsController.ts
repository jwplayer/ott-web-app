import ini from 'ini';

import { Settings, useSettingsStore } from '#src/stores/SettingsStore';

export const initSettings = async () => {
  const settings = await fetch('/.webapp.ini')
    .then((result) => result.text())
    .then((iniString) => ini.parse(iniString) as Settings);

  if (!settings) {
    throw new Error('Unable to load .webapp.ini');
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
