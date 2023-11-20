import 'vi-fetch/setup';
import 'reflect-metadata';
import '@testing-library/jest-dom'; // Including this for the expect extensions
import 'react-app-polyfill/stable';
import type { ComponentType } from 'react';

const country = {
  af: 'Afghanistan',
  ax: 'Åland Islands',
  al: 'Albania',
};

const usStates = {
  al: 'Alabama',
  ak: 'Alaska',
  az: 'Arizona',
};

// stubs
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
);

// Mock the translation infra
// noinspection JSUnusedGlobalSymbols
vi.mock('react-i18next', () => ({
  default: () => ({
    t: (str: string) => str,
  }),
  // this mock makes sure any components using the translate HoC receive the t function as a prop
  withTranslation: () => (Component: ComponentType) => {
    Component.defaultProps = { ...Component.defaultProps, t: () => '' };
    return Component;
  },
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    // noinspection JSUnusedGlobalSymbols
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () =>
          new Promise(() => {
            /* */
          }),
        getResourceBundle: (_: string, ns: string) => ({ country, us_state: usStates }[ns]),
      },
    };
  },
}));
