import { createStore } from './utils';

type UIState = {
  searchQuery: string;
  searchActive: boolean;
  userMenuOpen: boolean;
  sideBarOpen: boolean;
  cookieWallOpen: boolean;
  languageMenuOpen: boolean;
  preSearchPage?: string;
};

export const useUIStore = createStore<UIState>('UIStore', () => ({
  searchQuery: '',
  searchActive: false,
  userMenuOpen: false,
  sideBarOpen: false,
  languageMenuOpen: false,
  cookieWallOpen: false,
}));
