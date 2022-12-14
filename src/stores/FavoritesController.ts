import i18next from 'i18next';

import { useAccountStore } from '#src/stores/AccountStore';
import { getMediaItems, updatePersonalShelves } from '#src/stores/AccountController';
import * as persist from '#src/utils/persist';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { Favorite, SerializedFavorite } from '#types/favorite';
import type { PlaylistItem } from '#types/playlist';
import { MAX_WATCHLIST_ITEMS_COUNT } from '#src/config';

const PERSIST_KEY_FAVORITES = `favorites${window.configId ? `-${window.configId}` : ''}`;

export const restoreFavorites = async () => {
  const { user } = useAccountStore.getState();
  const favoritesList = useConfigStore.getState().config.features?.favoritesList;

  const savedItems = user ? user.externalData?.favorites : persist.getItem<Favorite[]>(PERSIST_KEY_FAVORITES);

  if (savedItems?.length && favoritesList) {
    const playlistItems = await getMediaItems(
      favoritesList,
      savedItems.map(({ mediaid }) => mediaid),
    );

    const favorites = (playlistItems || []).map((item) => createFavorite(item));

    useFavoritesStore.setState({ favorites });
  }
};

export const serializeFavorites = (favorites: Favorite[]): SerializedFavorite[] => {
  return favorites.map(({ mediaid }) => ({ mediaid }));
};

export const persistFavorites = () => {
  const { favorites } = useFavoritesStore.getState();
  const { user } = useAccountStore.getState();

  if (user) {
    return updatePersonalShelves();
  }

  persist.setItem(PERSIST_KEY_FAVORITES, serializeFavorites(favorites));
};

export const initializeFavorites = async () => {
  await restoreFavorites();
};

export const saveItem = async (item: PlaylistItem) => {
  const { favorites } = useFavoritesStore.getState();

  if (!favorites.some(({ mediaid }) => mediaid === item.mediaid)) {
    useFavoritesStore.setState({ favorites: [createFavorite(item)].concat(favorites) });
  }

  await persistFavorites();
};

export const removeItem = async (item: PlaylistItem) => {
  const { favorites } = useFavoritesStore.getState();

  useFavoritesStore.setState({ favorites: favorites.filter(({ mediaid }) => mediaid !== item.mediaid) });

  await persistFavorites();
};

export const toggleFavorite = async (item: PlaylistItem | undefined) => {
  const { favorites, hasItem, setWarning } = useFavoritesStore.getState();

  if (!item) {
    return;
  }

  const isFavorited = hasItem(item);

  if (isFavorited) {
    await removeItem(item);

    return;
  }

  // If we exceed the max available number of favorites, we show a warning
  if (favorites?.length >= MAX_WATCHLIST_ITEMS_COUNT) {
    setWarning(i18next.t('video:favorites_warning', { maxCount: MAX_WATCHLIST_ITEMS_COUNT }));
    return;
  }

  await saveItem(item);
};

export const clear = async () => {
  useFavoritesStore.setState({ favorites: [] });

  await persistFavorites();
};

const createFavorite = (item: PlaylistItem): Favorite =>
  ({
    mediaid: item.mediaid,
    title: item.title,
    tags: item.tags,
    duration: item.duration,
    playlistItem: item,
  } as Favorite);
