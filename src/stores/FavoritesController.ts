import i18next from 'i18next';
import { inject, injectable } from 'inversify';

import { useAccountStore } from '#src/stores/AccountStore';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import FavoritesService from '#src/services/favorites.service';
import AccountService from '#src/services/account.service';
import type { PlaylistItem } from '#types/playlist';
import type { Favorite, SerializedFavorite } from '#types/favorite';
import type { Customer } from '#types/account';
import { getNamedModule } from '#src/modules/container';
import type { IntegrationType } from '#types/Config';

@injectable()
export default class FavoritesController {
  private readonly favoritesService: FavoritesService;
  private readonly accountService?: AccountService;

  constructor(@inject('INTEGRATION_TYPE') integrationType: IntegrationType, favoritesService: FavoritesService) {
    this.favoritesService = favoritesService;
    this.accountService = getNamedModule(AccountService, integrationType, false);
  }

  private updateUserFavorites(favorites: Favorite[]) {
    const { user } = useAccountStore.getState();

    if (user) {
      useAccountStore.setState((state) => ({
        ...state,
        user: {
          ...(state.user as Customer),
          externalData: { ...state.user?.externalData, favorites: this.serializeFavorites(favorites) },
        },
      }));
    }
  }

  restoreFavorites = async () => {
    const { user } = useAccountStore.getState();
    const favoritesList = useConfigStore.getState().config.features?.favoritesList;

    if (!favoritesList) {
      return;
    }
    const favorites = await this.favoritesService.getFavorites(user, favoritesList);

    if (!favorites) {
      return;
    }

    useFavoritesStore.setState({ favorites, favoritesPlaylistId: favoritesList });
  };

  persistFavorites = async () => {
    const { favorites } = useFavoritesStore.getState();
    const { user } = useAccountStore.getState();
    const { isSandbox } = useConfigStore.getState();

    if (user?.id && user?.externalData) {
      return this.accountService?.updatePersonalShelves({ id: user.id, externalData: user.externalData }, isSandbox);
    }

    this.favoritesService.persistFavorites(favorites);
  };

  serializeFavorites = (favorites: Favorite[]): SerializedFavorite[] => {
    return this.favoritesService.serializeFavorites(favorites);
  };

  initialize = async () => {
    await this.restoreFavorites();
  };

  saveItem = async (item: PlaylistItem) => {
    const { favorites } = useFavoritesStore.getState();

    if (!favorites.some(({ mediaid }) => mediaid === item.mediaid)) {
      const items = [this.favoritesService.createFavorite(item)].concat(favorites);
      useFavoritesStore.setState({ favorites: items });
      this.updateUserFavorites(items);
      await this.persistFavorites();
    }
  };

  removeItem = async (item: PlaylistItem) => {
    const { favorites } = useFavoritesStore.getState();

    const items = favorites.filter(({ mediaid }) => mediaid !== item.mediaid);
    useFavoritesStore.setState({ favorites: items });
    this.updateUserFavorites(items);

    await this.persistFavorites();
  };

  toggleFavorite = async (item: PlaylistItem | undefined) => {
    const { favorites, hasItem, setWarning } = useFavoritesStore.getState();

    if (!item) {
      return;
    }

    const isFavorited = hasItem(item);

    if (isFavorited) {
      await this.removeItem(item);

      return;
    }

    // If we exceed the max available number of favorites, we show a warning
    if (this.favoritesService.hasReachedFavoritesLimit(favorites)) {
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
