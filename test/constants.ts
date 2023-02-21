export interface TestConfig {
  id: string;
  label: string;
}

export const testConfigs = {
  jwpAuth: {
    id: '9qqwmnbx',
    label: 'JWP AUTHVOD',
  },
  jwpSvod: {
    id: 'a2kbjdv0',
    label: 'JWP SVOD',
  },
  basicNoAuth: {
    id: 'gnnuzabk',
    label: 'Demo App (No Auth)',
  },
  noStyling: {
    id: 'kujzeu1b',
    label: 'No Styling (No Auth)',
  },
  inlinePlayer: {
    id: 'ata6ucb8',
    label: 'Inline Player',
  },
  cleengAuthvod: {
    id: 'nvqkufhy',
    label: 'Cleeng Authvod',
  },
  cleengAuthvodNoWatchlist: {
    id: '7weyqrua',
    label: 'Cleeng Authvod (No WL)',
  },
  svod: {
    id: 'ozylzc5m',
    label: 'Cleeng SVOD',
  },
};

export const jwDevEnvConfigs = {
  basicNoAuth: {
    id: 'uzcyv8xh',
    label: 'JW-Dev Basic Demo',
  } as TestConfig,
};

export const overrideIPCookieKey = 'overrideIP';
