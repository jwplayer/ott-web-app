import { inject, injectable } from 'inversify';
import { object, array, string } from 'yup';

import type { Favorite, SerializedFavorite } from '../../types/favorite';
import type { PlaylistItem } from '../../types/playlist';
import type { Customer } from '../../types/account';
import { getNamedModule } from '../modules/container';
import { INTEGRATION_TYPE } from '../modules/types';
import { logDev } from '../utils/common';
import { MAX_WATCHLIST_ITEMS_COUNT } from '../constants';

import ApiService from './ApiService';
import StorageService from './StorageService';
import AccountService from './integrations/AccountService';

const schema = array(
  object().shape({
    mediaid: string(),
  }),
);

@injectable()
export default class FavoriteService {
  private PERSIST_KEY_FAVORITES = 'favorites';

  private readonly apiService;
  private readonly storageService;
  private readonly accountService;

  constructor(@inject(INTEGRATION_TYPE) integrationType: string, apiService: ApiService, storageService: StorageService) {
    this.apiService = apiService;
    this.storageService = storageService;
    this.accountService = getNamedModule(AccountService, integrationType, false);
  }

  private validateFavorites(favorites: unknown) {
    if (favorites && schema.validateSync(favorites)) {
      return favorites as SerializedFavorite[];
    }

    return [];
  }

  private async getFavoritesFromAccount(user: Customer) {
    const favorites = await this.accountService?.getFavorites({ user });

    return this.validateFavorites(favorites);
  }

  private async getFavoritesFromStorage() {
    const favorites = await this.storageService.getItem(this.PERSIST_KEY_FAVORITES, true);

    return this.validateFavorites(favorites);
  }

  getFavorites = async (user: Customer | null, favoritesList: string) => {
    const savedItems = user ? await this.getFavoritesFromAccount(user) : await this.getFavoritesFromStorage();
    const mediaIds = savedItems.map(({ mediaid }) => mediaid);

    if (!mediaIds) {
      return [];
    }

    try {
      const playlistItems = await this.apiService.getMediaByWatchlist(favoritesList, mediaIds);

      return (playlistItems || []).map((item) => this.createFavorite(item));
    } catch (error: unknown) {
      logDev('Failed to get favorites', error);
    }

    return [];
  };

  serializeFavorites = (favorites: Favorite[]): SerializedFavorite[] => {
    return favorites.map(({ mediaid }) => ({ mediaid }));
  };

  persistFavorites = async (favorites: Favorite[], user: Customer | null) => {
    if (user) {
      return this.accountService?.updateFavorites({
        favorites: this.serializeFavorites(favorites),
        user,
      });
    } else {
      await this.storageService.setItem(this.PERSIST_KEY_FAVORITES, JSON.stringify(this.serializeFavorites(favorites)));
    }
  };

  getMaxFavoritesCount = () => {
    return this.accountService?.features?.watchListSizeLimit || MAX_WATCHLIST_ITEMS_COUNT;
  };

  createFavorite = (item: PlaylistItem): Favorite => {
    return {
      mediaid: item.mediaid,
      title: item.title,
      tags: item.tags,
      duration: item.duration,
      playlistItem: item,
    } as Favorite;
  };
}
