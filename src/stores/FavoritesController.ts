import i18next from 'i18next';

import { getMediaItems } from '#src/stores/AccountController';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { Favorite, SerializedFavorite } from '#types/favorite';
import type { PlaylistItem } from '#types/playlist';
import { MAX_WATCHLIST_ITEMS_COUNT } from '#src/config';
import { getIntegration } from '#src/integration';
import * as favoritesService from '#src/services/favorites.service';

export const restoreFavorites = async () => {
  const favoritesList = useConfigStore.getState().config.features?.favoritesList;
  const integration = getIntegration();

  const savedItems = integration ? await integration.getFavorites() : await favoritesService.getFavorites();

  if (savedItems?.length && favoritesList) {
    const playlistItems = await getMediaItems(
      favoritesList,
      savedItems.map(({ mediaid }) => mediaid),
    );

    const favorites = (playlistItems || []).map((item) => createFavorite(item));

    useFavoritesStore.setState({ favorites, favoritesPlaylistId: favoritesList });
  }
};

export const serializeFavorites = (favorites: Favorite[]): SerializedFavorite[] => {
  return favorites.map(({ mediaid }) => ({ mediaid }));
};

export const initializeFavorites = async () => {
  await restoreFavorites();
};

export const saveItem = async (item: PlaylistItem) => {
  const integration = getIntegration();
  const { favorites, hasItem } = useFavoritesStore.getState();

  if (!hasItem(item)) {
    integration ? await integration.saveFavorite(item) : await favoritesService.saveFavorite(item);

    useFavoritesStore.setState({ favorites: [createFavorite(item)].concat(favorites) });
  }
};

export const removeItem = async (item: PlaylistItem) => {
  const integration = getIntegration();
  const { favorites, hasItem } = useFavoritesStore.getState();

  if (hasItem(item)) {
    integration ? await integration.removeFavorite(item) : await favoritesService.removeFavorite(item);

    useFavoritesStore.setState({ favorites: favorites.filter(({ mediaid }) => mediaid !== item.mediaid) });
  }
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
  const integration = getIntegration();

  integration ? await integration.clearFavorites() : await favoritesService.clearFavorites();
  useFavoritesStore.setState({ favorites: [] });
};

const createFavorite = (item: PlaylistItem): Favorite =>
  ({
    mediaid: item.mediaid,
    title: item.title,
    tags: item.tags,
    duration: item.duration,
    playlistItem: item,
  } as Favorite);
