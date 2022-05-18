import { useAccountStore } from '#src/stores/AccountStore';
import { updatePersonalShelves } from '#src/stores/AccountController';
import * as persist from '#src/utils/persist';
import { getMediaByIds } from '#src/services/api.service';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import type { Favorite } from '#types/favorite';
import type { PlaylistItem } from '#types/playlist';

const PERSIST_KEY_FAVORITES = `favorites${window.configId ? `-${window.configId}` : ''}`;

export const restoreFavorites = async () => {
  const { user } = useAccountStore.getState();
  const savedItems = user ? user.externalData?.favorites : persist.getItem<Favorite[]>(PERSIST_KEY_FAVORITES);

  if (savedItems) {
    const playlistItems = await getMediaByIds(savedItems.map(({ mediaid }) => mediaid));
    const favorites = playlistItems.map((item) => createFavorite(item));

    useFavoritesStore.setState({ favorites });
  }
};

export const serializeFavorites = (favorites: Favorite[]) => {
  return favorites.map(({ mediaid, title, tags, duration }) => ({ mediaid, title, tags, duration }));
};

export const persistFavorites = () => {
  const { favorites } = useFavoritesStore.getState();
  const { user } = useAccountStore.getState();

  if (user) {
    return updatePersonalShelves();
  }

  return persist.setItem(PERSIST_KEY_FAVORITES, serializeFavorites(favorites));
};

export const initializeFavorites = async () => {
  restoreFavorites();
};

export const saveItem = (item: PlaylistItem) => {
  const { favorites } = useFavoritesStore.getState();

  if (!favorites.some(({ mediaid }) => mediaid === item.mediaid)) {
    useFavoritesStore.setState({ favorites: [createFavorite(item)].concat(favorites) });
  }

  persistFavorites();
};

export const removeItem = (item: PlaylistItem) => {
  const { favorites } = useFavoritesStore.getState();

  useFavoritesStore.setState({ favorites: favorites.filter(({ mediaid }) => mediaid !== item.mediaid) });

  persistFavorites();
};

export const clear = () => {
  useFavoritesStore.setState({ favorites: [] });

  persistFavorites();
};

const createFavorite = (item: PlaylistItem): Favorite =>
  ({
    mediaid: item.mediaid,
    title: item.title,
    tags: item.tags,
    duration: item.duration,
    playlistItem: item,
  } as Favorite);
