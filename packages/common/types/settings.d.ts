export type Settings = {
  defaultConfigSource?: string;
  playerId: string;
  playerLicenseKey?: string;
  additionalAllowedConfigSources?: string[];
  UNSAFE_allowAnyConfigSource?: boolean;
};
