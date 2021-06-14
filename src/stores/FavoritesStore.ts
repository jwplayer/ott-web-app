import { Store } from 'pullstate';

type Favorite = {
  mediaId: string;
};

type FavoritesStore = {
  favorites: Favorite[];
};

export const FavoritesStore = new Store<FavoritesStore>({
  favorites: [{ mediaId: '' }],
});
