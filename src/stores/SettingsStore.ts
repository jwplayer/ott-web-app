import { createStore } from '#src/stores/utils';

export interface Settings {
  defaultConfigSource?: string;
  playerId?: string;
  playerKey?: string;
  additionalAllowedConfigSources?: string[];
  UNSAFE_allowAnyConfigSource?: boolean;
}

export const useSettingsStore = createStore<Settings>('SettingsStore', () => ({
  additionalAllowedConfigSources: [],
}));
