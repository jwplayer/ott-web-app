import type { LocationDescriptor } from 'history';

import { createStore } from './utils';

import type { ImageData } from '#types/playlist';

type UIState = {
  blurImage?: ImageData;
  blurFallbackImage?: string;
  searchQuery: string;
  searchActive: boolean;
  userMenuOpen: boolean;
  preSearchPage?: LocationDescriptor<unknown>;
};

export const useUIStore = createStore<UIState>('UIStore', () => ({
  blurImage: undefined,
  searchQuery: '',
  searchActive: false,
  userMenuOpen: false,
}));
