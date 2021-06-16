import { Store } from 'pullstate';

import type { Playlist, PlaylistItem } from '../../types/playlist';
import * as persist from '../utils/persist';
import type { Favorite } from '../../types/favorite';
import { getMediaByIds } from '../services/api.service';

type FavoritesStore = {
  favorites: Playlist;
};

const PERSIST_KEY_FAVORITES = `favorites${window.configId ? `-${window.configId}` : ''}`;

export const favoritesStore = new Store<FavoritesStore>({
  favorites: {
    feedid: 'favorites',
    title: 'Favorites',
    playlist: [],
  },
});

export const initializeFavorites = async () => {
  const savedItems: Favorite[] | null = persist.getItem(PERSIST_KEY_FAVORITES) as Favorite[] | null;

  if (savedItems) {
    const playlistItems = await getMediaByIds(savedItems.map(({ mediaid }) => mediaid));

    favoritesStore.update((state) => {
      state.favorites.playlist = playlistItems;
    });
  }

  return favoritesStore.subscribe(state => state.favorites, (favorites) => {
    persist.setItem(PERSIST_KEY_FAVORITES, favorites.playlist.map(playlistItem => ({
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
      if (!o.favorites.playlist.some(current => current.mediaid === item.mediaid)) {
        s.favorites.playlist.unshift(item);
      }
    });
  };

  const removeItem = (item: PlaylistItem) => {
    favoritesStore.update((s) => {
      s.favorites.playlist = s.favorites.playlist.filter(current => current.mediaid !== item.mediaid);
    });
  };

  const hasItem = (item: PlaylistItem) => {
    return favorites.playlist.some(current => current.mediaid === item.mediaid);
  };

  return { saveItem, removeItem, hasItem };
};
