export interface TestConfig {
  id: string;
  label: string;
}

export const testConfigs = {
  basicNoAuth: {
    id: 'gnnuzabk',
    label: 'Demo App (No Auth)',
  } as TestConfig,
  noStyling: {
    id: 'kujzeu1b',
    label: 'No Styling (No Auth)',
  } as TestConfig,
  inlinePlayer: {
    id: 'ata6ucb8',
    label: 'Inline Player',
  } as TestConfig,
  authvod: {
    id: 'nvqkufhy',
    label: 'Authvod',
  } as TestConfig,
  authvodNoWatchlist: {
    id: '7weyqrua',
    label: 'Authvod (No Watchlists)',
  } as TestConfig,
  svod: {
    id: 'ozylzc5m',
    label: 'SVOD',
  } as TestConfig,
};

export const jwDevEnvConfigs = {
  basicNoAuth: {
    id: 'uzcyv8xh',
    label: 'JW-Dev Basic Demo',
  } as TestConfig,
};

export const overrideIPCookieKey = 'overrideIP';
