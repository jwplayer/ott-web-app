import type { Location } from 'react-router-dom';

import { createStore } from './utils';

type UIState = {
  searchQuery: string;
  searchActive: boolean;
  userMenuOpen: boolean;
  preSearchPage?: Location;
};

export const useUIStore = createStore<UIState>('UIStore', () => ({
  searchQuery: '',
  searchActive: false,
  userMenuOpen: false,
}));
