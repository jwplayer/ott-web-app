import { Store } from 'pullstate';

type UIStore = {
  blurImage: string;
};

export const UIStore = new Store<UIStore>({
  blurImage: '',
});
