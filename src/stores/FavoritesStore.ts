import { createStore } from './utils';

import type { Favorite } from '#types/favorite';
import { PersonalShelf } from '#src/enum/PersonalShelf';
import type { Playlist, PlaylistItem } from '#types/playlist';

type FavoritesState = {
  favorites: Favorite[];
  hasItem: (item: PlaylistItem) => boolean;
  getPlaylist: () => Playlist;
};

export const useFavoritesStore = createStore<FavoritesState>('FavoritesState', (_, get) => ({
  favorites: [],
  hasItem: (item: PlaylistItem) => get().favorites.some((favoriteItem) => favoriteItem.mediaid === item.mediaid),
  getPlaylist: () =>
    ({
      feedid: PersonalShelf.Favorites,
      title: 'Favorites',
      playlist: get().favorites.map(({ playlistItem }) => playlistItem),
    } as Playlist),
}));
