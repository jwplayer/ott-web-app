import { Store } from 'pullstate';

import type { PlaylistItem } from '../../types/playlist';
import * as persist from '../utils/persist';
import type { Favorite } from '../../types/favorite';
import { getMediaByIds } from '../services/api.service';

type FavoritesStore = {
  favorites: PlaylistItem[];
};

const PERSIST_KEY_FAVORITES = `favorites${window.configId ? `-${window.configId}` : ''}`;

export const favoritesStore = new Store<FavoritesStore>({
  favorites: [],
});

export const initializeFavorites = async () => {
  const savedFavorites: Favorite[] | null = persist.getItem(PERSIST_KEY_FAVORITES) as Favorite[] | null;

  if (savedFavorites) {
    const favoritesPlaylist = await getMediaByIds(savedFavorites.map(({ mediaid }) => mediaid));

    favoritesStore.update((state) => {
      state.favorites = favoritesPlaylist;
    });
  }

  return favoritesStore.subscribe(state => state.favorites, (favorites) => {
    persist.setItem(PERSIST_KEY_FAVORITES, favorites.map(playlistItem => ({
      mediaid: playlistItem.mediaid,
      title: playlistItem.title,
      tags: playlistItem.tags,
      duration: playlistItem.duration,
    }) as Favorite));
  });
};

type SaveItemFn = (item: PlaylistItem) => void;
type RemoveItemFn = (item: PlaylistItem) => void;
type HasItemFn = (item: PlaylistItem) => boolean;

export const useFavorites = (): { saveItem: SaveItemFn, removeItem: RemoveItemFn, hasItem: HasItemFn } => {
  const favorites = favoritesStore.useState((s) => s.favorites);

  const saveItem = (item: PlaylistItem) => {
    favoritesStore.update((s, o) => {
      if (!o.favorites.some(current => current.mediaid === item.mediaid)) {
        s.favorites.push(item);
      }
    });
  };

  const removeItem = (item: PlaylistItem) => {
    favoritesStore.update((s) => {
      s.favorites = s.favorites.filter(current => current.mediaid !== item.mediaid);
    });
  };

  const hasItem = (item: PlaylistItem) => {
    return favorites.some(current => current.mediaid === item.mediaid);
  };

  return { saveItem, removeItem, hasItem };
};
