import type { LocationDescriptor } from 'history';

import { createStore } from './utils';

type UIState = {
  blurImage: string;
  blurFallbackImage?: string;
  searchQuery: string;
  searchActive: boolean;
  userMenuOpen: boolean;
  preSearchPage?: LocationDescriptor<unknown>;
};

export const useUIStore = createStore<UIState>('UIStore', () => ({
  blurImage: '',
  blurFallbackImage: '',
  searchQuery: '',
  searchActive: false,
  userMenuOpen: false,
}));
