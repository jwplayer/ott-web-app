import { Store } from 'pullstate';

type UIStore = {
  blurImage: string;
  searchQuery: string;
};

export const UIStore = new Store<UIStore>({
  blurImage: '',
  searchQuery: '',
});
