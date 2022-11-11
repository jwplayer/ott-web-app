import { Settings, useSettingsStore } from '#src/stores/SettingsStore';

export const initSettings = async () => {
  const settings: Settings = await fetch('/settings.json').then((result) => result.json());
  useSettingsStore.setState(settings);

  return settings;
};
