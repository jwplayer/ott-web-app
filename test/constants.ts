import type { TestConfig } from './types';

export const testConfigs = {
  jwpAuth: {
    id: '9qqwmnbx',
    label: 'JWP AUTHVOD',
  },
  jwpSvod: {
    id: 'a2kbjdv0',
    label: 'JWP SVOD',
  },
  jwpAuthNoWatchlist: {
    id: 'oqrsyxin',
    label: 'JWP Authvod (No WL)',
  },
  basicNoAuth: {
    id: 'ehon8mco',
    label: 'Demo App (No Auth)',
  },
  noStyling: {
    id: 'kujzeu1b',
    label: 'No Styling (No Auth)',
  },
  inlinePlayer: {
    id: '7xlh4b33',
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
