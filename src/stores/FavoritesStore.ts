import { createStore } from './utils';

import type { Favorite } from '#types/favorite';
import { PersonalShelf } from '#src/stores/ConfigStore';
import type { Playlist, PlaylistItem } from '#types/playlist';

type FavoritesState = {
  favorites: Favorite[];
  warning: string | null;
  hasItem: (item: PlaylistItem) => boolean;
  getPlaylist: () => Playlist;
  setWarning: (warning: string) => void;
  clearWarning: () => void;
};

export const useFavoritesStore = createStore<FavoritesState>('FavoritesState', (set, get) => ({
  favorites: [],
  warning: null,
  setWarning: (message: string | null) => set({ warning: message }),
  clearWarning: () => set({ warning: null }),
  hasItem: (item: PlaylistItem) => get().favorites.some((favoriteItem) => favoriteItem.mediaid === item.mediaid),
  getPlaylist: () =>
    ({
      feedid: PersonalShelf.Favorites,
      title: 'Favorites',
      playlist: get().favorites.map(({ playlistItem }) => playlistItem),
    } as Playlist),
}));
