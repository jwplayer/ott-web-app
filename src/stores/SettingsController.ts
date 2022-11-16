import ini from 'ini';

import { Settings, useSettingsStore } from '#src/stores/SettingsStore';

export const initSettings = async () => {
  const settings = await fetch('/.webapp.ini')
    .then((result) => result.text())
    .then((iniString) => ini.parse(iniString) as Settings);
  useSettingsStore.setState(settings);

  return settings;
};
