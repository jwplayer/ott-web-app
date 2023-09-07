import type { Location } from 'react-router-dom';

import { createStore } from '#src/utils/createStore';

type UIState = {
  searchQuery: string;
  searchActive: boolean;
  userMenuOpen: boolean;
  languageMenuOpen: boolean;
  preSearchPage?: Location;
};

export const useUIStore = createStore<UIState>('UIStore', () => ({
  searchQuery: '',
  searchActive: false,
  languageMenuOpen: false,
  userMenuOpen: false,
}));
