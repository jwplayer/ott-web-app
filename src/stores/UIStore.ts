import type { LocationDescriptor } from 'history';

import { createStore } from './utils';

type UIState = {
  blurImage: string;
  searchQuery: string;
  searchActive: boolean;
  userMenuOpen: boolean;
  preSearchPage?: LocationDescriptor<unknown>;
  showDebugTools: boolean;
};

export const useUIStore = createStore<UIState>('UIStore', () => ({
  blurImage: '',
  searchQuery: '',
  searchActive: false,
  userMenuOpen: false,
  showDebugTools: false,
}));
