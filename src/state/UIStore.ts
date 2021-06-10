import { Store } from 'pullstate';

type UIStore = {
  blurImage: string;
  searchQuery: '';
};

export const UIStore = new Store<UIStore>({
  blurImage: '',
  searchQuery: '',
});
