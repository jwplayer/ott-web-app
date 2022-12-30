export interface TestConfig {
  id: string;
  label: string;
}

export const testConfigs = {
  inplayerAuth: {
    id: 'https://web-ott.s3.eu-west-1.amazonaws.com/apps/configs/daily-avod.json',
    label: 'InPlayer AUTHVOD',
  },
  inplayerSvod: {
    id: 'https://web-ott.s3.eu-west-1.amazonaws.com/apps/configs/demo.json',
    label: 'InPlayer SVOD',
  },
  inplayerHosted: {
    id: 'a2kbjdv0',
    label: 'InPlayer Hosted',
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
    label: 'SVOD',
  },
};

export const jwDevEnvConfigs = {
  basicNoAuth: {
    id: 'uzcyv8xh',
    label: 'JW-Dev Basic Demo',
  } as TestConfig,
};

export const overrideIPCookieKey = 'overrideIP';
