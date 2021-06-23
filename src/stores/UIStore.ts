import { Store } from 'pullstate';

type UIStore = {
  blurImage: string;
  searchQuery: string;
  searchActive: boolean;
};

export const UIStore = new Store<UIStore>({
  blurImage: '',
  searchQuery: '',
  searchActive: false,
});
