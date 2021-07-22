import { Store } from 'pullstate';

type UIStore = {
  blurImage: string;
  searchQuery: string;
  searchActive: boolean;
  userMenuOpen: boolean;
};

export const UIStore = new Store<UIStore>({
  blurImage: '',
  searchQuery: '',
  searchActive: false,
  userMenuOpen: false,
});
