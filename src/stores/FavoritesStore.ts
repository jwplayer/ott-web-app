import { createStore } from './utils';

import type { Favorite } from '#types/favorite';
import { PersonalShelf } from '#src/enum/PersonalShelf';
import type { Playlist, PlaylistItem } from '#types/playlist';

type FavoritesState = {
  favorites: Favorite[];
  isWarningShown: boolean;
  hasItem: (item: PlaylistItem) => boolean;
  getPlaylist: () => Playlist;
  toggleWarning: () => void;
};

export const useFavoritesStore = createStore<FavoritesState>('FavoritesState', (set, get) => ({
  favorites: [],
  isWarningShown: false,
  toggleWarning: () => set({ isWarningShown: !get().isWarningShown }),
  hasItem: (item: PlaylistItem) => get().favorites.some((favoriteItem) => favoriteItem.mediaid === item.mediaid),
  getPlaylist: () =>
    ({
      feedid: PersonalShelf.Favorites,
      title: 'Favorites',
      playlist: get().favorites.map(({ playlistItem }) => playlistItem),
    } as Playlist),
}));
