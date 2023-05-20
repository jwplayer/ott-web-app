import * as persist from '#src/utils/persist';
import type { SerializedFavorite } from '#types/favorite';
import type { PlaylistItem } from '#types/playlist';

const PERSIST_KEY_FAVORITES = `favorites${window.configId ? `-${window.configId}` : ''}`;

export const saveFavorite = async (item: PlaylistItem) => {
  const favorites = await getFavorites();
  const updatedFavorites = [{ mediaid: item.mediaid }, ...favorites];

  persist.setItem(PERSIST_KEY_FAVORITES, updatedFavorites);

  return updatedFavorites;
};

export const removeFavorite = async (item: PlaylistItem) => {
  const favorites = await getFavorites();
  const updatedFavorites = favorites.filter(({ mediaid }) => mediaid !== item.mediaid);

  persist.setItem(PERSIST_KEY_FAVORITES, updatedFavorites);

  return updatedFavorites;
};

export const clearFavorites = async () => {
  persist.setItem(PERSIST_KEY_FAVORITES, []);
};

export const getFavorites = async () => {
  const favorites = persist.getItem<SerializedFavorite[]>(PERSIST_KEY_FAVORITES) || [];

  return favorites || [];
};
