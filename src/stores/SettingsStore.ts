import { createStore } from '#src/stores/utils';
import { OTT_GLOBAL_PLAYER_ID } from '#src/config';

export interface Settings {
  defaultConfigSource?: string;
  playerId: string;
  playerLicenseKey?: string;
  additionalAllowedConfigSources?: string[];
  UNSAFE_allowAnyConfigSource?: boolean;
}

export const useSettingsStore = createStore<Settings>('SettingsStore', () => ({
  additionalAllowedConfigSources: [],
  playerId: OTT_GLOBAL_PLAYER_ID,
}));
