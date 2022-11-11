import { createStore } from '#src/stores/utils';

export interface Settings {
  defaultConfigSource?: string;
  allowedConfigSources?: string[];
  unsafeAllowAnyConfigSource?: boolean;
}

export const useSettingsStore = createStore<Settings>('SettingsStore', () => ({
  allowedConfigSources: [],
}));
