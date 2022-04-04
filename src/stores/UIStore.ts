import { Store } from 'pullstate';
import type { LocationDescriptor } from 'history';

type UIStore = {
  blurImage: string;
  searchQuery: string;
  searchActive: boolean;
  userMenuOpen: boolean;
  preSearchPage?: LocationDescriptor<unknown>;
};

export const UIStore = new Store<UIStore>({
  blurImage: '',
  searchQuery: '',
  searchActive: false,
  userMenuOpen: false,
});
