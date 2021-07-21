import { Store } from 'pullstate';

import { PersonalShelf } from '../enum/PersonalShelf';
import type { Playlist, PlaylistItem } from '../../types/playlist';
import * as persist from '../utils/persist';
import type { Favorite } from '../../types/favorite';
import { getMediaByIds } from '../services/api.service';

type FavoritesStore = {
  favorites: Favorite[];
};

const PERSIST_KEY_FAVORITES = `favorites${window.configId ? `-${window.configId}` : ''}`;

export const favoritesStore = new Store<FavoritesStore>({
  favorites: [],
});

export const initializeFavorites = async () => {
  const savedItems: Favorite[] | null = persist.getItem(PERSIST_KEY_FAVORITES) as Favorite[] | null;

  if (savedItems) {
    const playlistItems = await getMediaByIds(savedItems.map(({ mediaid }) => mediaid));
    const favorites = playlistItems.map((item) => createFavorite(item));

    favoritesStore.update((state) => {
      state.favorites = favorites;
    });
  }

  return favoritesStore.subscribe(
    (state) => state.favorites,
    (favorites) =>
      persist.setItem(
        PERSIST_KEY_FAVORITES,
        favorites.map(({ mediaid, title, tags, duration }) => ({ mediaid, title, tags, duration })),
      ),
  );
};

const createFavorite = (item: PlaylistItem): Favorite =>
  ({
    mediaid: item.mediaid,
    title: item.title,
    tags: item.tags,
    duration: item.duration,
    playlistItem: item,
  } as Favorite);

type SaveItemFn = (item: PlaylistItem) => void;
type RemoveItemFn = (item: PlaylistItem) => void;
type HasItemFn = (item: PlaylistItem) => boolean;
type ClearListFn = () => void;
type getPlaylistFn = () => Playlist;

type UseFavoritesReturn = {
  saveItem: SaveItemFn;
  removeItem: RemoveItemFn;
  hasItem: HasItemFn;
  clearList: ClearListFn;
  getPlaylist: getPlaylistFn;
};

export const useFavorites = (): UseFavoritesReturn => {
  const favorites = favoritesStore.useState((state) => state.favorites);

  const saveItem = (item: PlaylistItem) => {
    favoritesStore.update((state, orginal) => {
      if (!orginal.favorites.some(({ mediaid }) => mediaid === item.mediaid)) {
        state.favorites.unshift(createFavorite(item));
      }
    });
  };

  const removeItem = (item: PlaylistItem) => {
    favoritesStore.update((state) => {
      state.favorites = state.favorites.filter(({ mediaid }) => mediaid !== item.mediaid);
    });
  };

  const hasItem = (item: PlaylistItem) => {
    return favorites.some(({ mediaid }) => mediaid === item.mediaid);
  };

  const clearList = () => {
    favoritesStore.update((state) => {
      state.favorites = [];
    });
  };

  const getPlaylist = () => {
    return {
      feedid: PersonalShelf.Favorites,
      title: 'Favorites',
      playlist: favorites.map(({ playlistItem }) => playlistItem),
    } as Playlist;
  };

  return { saveItem, removeItem, hasItem, clearList, getPlaylist };
};
