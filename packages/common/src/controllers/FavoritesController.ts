import i18next from 'i18next';
import { injectable } from 'inversify';

import FavoriteService from '../services/FavoriteService';
import type { PlaylistItem } from '../../types/playlist';
import { useAccountStore } from '../stores/AccountStore';
import { useFavoritesStore } from '../stores/FavoritesStore';
import { useConfigStore } from '../stores/ConfigStore';

@injectable()
export default class FavoritesController {
  private readonly favoritesService: FavoriteService;

  constructor(favoritesService: FavoriteService) {
    this.favoritesService = favoritesService;
  }

  initialize = async () => {
    await this.restoreFavorites();
  };

  restoreFavorites = async () => {
    const { user } = useAccountStore.getState();
    const favoritesList = useConfigStore.getState().config.features?.favoritesList;

    if (!favoritesList) {
      return;
    }

    const favorites = await this.favoritesService.getFavorites(user, favoritesList);

    useFavoritesStore.setState({ favorites, favoritesPlaylistId: favoritesList });
  };

  persistFavorites = async () => {
    const { favorites } = useFavoritesStore.getState();
    const { user } = useAccountStore.getState();

    await this.favoritesService.persistFavorites(favorites, user);
  };

  saveItem = async (item: PlaylistItem) => {
    const { favorites } = useFavoritesStore.getState();

    if (!favorites.some(({ mediaid }) => mediaid === item.mediaid)) {
      const items = [this.favoritesService.createFavorite(item)].concat(favorites);
      useFavoritesStore.setState({ favorites: items });
      await this.persistFavorites();
    }
  };

  removeItem = async (item: PlaylistItem) => {
    const { favorites } = useFavoritesStore.getState();

    const items = favorites.filter(({ mediaid }) => mediaid !== item.mediaid);
    useFavoritesStore.setState({ favorites: items });

    await this.persistFavorites();
  };

  toggleFavorite = async (item: PlaylistItem | undefined) => {
    const { favorites, hasItem, setWarning } = useFavoritesStore.getState();

    if (!item) {
      return;
    }

    const isFavorite = hasItem(item);

    if (isFavorite) {
      await this.removeItem(item);

      return;
    }

    // If we exceed the max available number of favorites, we show a warning
    if (favorites.length > this.favoritesService.getMaxFavoritesCount()) {
      setWarning(i18next.t('video:favorites_warning', { maxCount: this.favoritesService.getMaxFavoritesCount() }));
      return;
    }

    await this.saveItem(item);
  };

  clear = async () => {
    useFavoritesStore.setState({ favorites: [] });

    await this.persistFavorites();
  };
}
