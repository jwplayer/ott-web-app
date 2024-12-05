import { inject, injectable } from 'inversify';
import { array, object, string } from 'yup';

import type { Favorite, SerializedFavorite } from '../../types/favorite';
import type { PlaylistItem } from '../../types/playlist';
import type { Customer } from '../../types/account';
import { getNamedModule } from '../modules/container';
import { INTEGRATION_TYPE } from '../modules/types';
import { MAX_WATCHLIST_ITEMS_COUNT } from '../constants';
import { logDebug, logError } from '../logger';

import ApiService from './ApiService';
import StorageService from './StorageService';
import AccountService from './integrations/AccountService';

const schema = array(
  object().shape({
    mediaid: string(),
  }),
).nullable();

@injectable()
export default class FavoriteService {
  private PERSIST_KEY_FAVORITES = 'favorites';
  private hasErrors = false;

  protected readonly apiService;
  protected readonly storageService;
  protected readonly accountService;

  constructor(
    @inject(INTEGRATION_TYPE) integrationType: string,
    @inject(ApiService) apiService: ApiService,
    @inject(StorageService) storageService: StorageService,
  ) {
    this.apiService = apiService;
    this.storageService = storageService;
    this.accountService = getNamedModule(AccountService, integrationType, false);
  }

  protected validateFavorites(favorites: unknown) {
    try {
      if (favorites && schema.validateSync(favorites)) {
        return favorites as SerializedFavorite[];
      }
    } catch (error: unknown) {
      this.hasErrors = true;
      logError('FavoritesService', 'Failed to validate favorites', { error });
    }

    return [];
  }

  protected async getFavoritesFromAccount(user: Customer) {
    const favorites = await this.accountService?.getFavorites({ user });

    return this.validateFavorites(favorites);
  }

  protected async getFavoritesFromStorage() {
    const favorites = await this.storageService.getItem(this.PERSIST_KEY_FAVORITES, true);

    return this.validateFavorites(favorites);
  }

  getFavorites = async (user: Customer | null, favoritesList: string, language?: string) => {
    const savedItems = user ? await this.getFavoritesFromAccount(user) : await this.getFavoritesFromStorage();
    const mediaIds = savedItems.map(({ mediaid }) => mediaid);

    if (!mediaIds) {
      return [];
    }

    try {
      const playlistItems = await this.apiService.getMediaByWatchlist({
        playlistId: favoritesList,
        mediaIds,
        language,
      });

      return (playlistItems || []).map((item) => this.createFavorite(item));
    } catch (error: unknown) {
      logError('FavoriteService', 'Failed to get favorites', { error });
    }

    return [];
  };

  serializeFavorites = (favorites: Favorite[]): SerializedFavorite[] => {
    return favorites.map(({ mediaid }) => ({ mediaid }));
  };

  persistFavorites = async (favorites: Favorite[], user: Customer | null) => {
    if (this.hasErrors) {
      return logDebug('FavoritesService', 'persist prevented due to an encountered problem while validating the stored favorites');
    }

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
