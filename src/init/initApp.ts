import type AccountController from '#src/stores/AccountController';
import type ConfigController from '#src/stores/ConfigController';
import type FavoritesController from '#src/stores/FavoritesController';
import type WatchHistoryController from '#src/stores/WatchHistoryController';
import { PersonalShelf } from '#src/config';
import { initIOCData } from '#src/ioc/init';
import { useController } from '#src/ioc/container';
import { CONTROLLERS, INTEGRATION_PROVIDER } from '#src/ioc/types';

export const initApp = async (configSource: string | undefined) => {
  const configController = useController<ConfigController>(CONTROLLERS.Config);

  const config = await configController.loadAndValidateConfig(configSource);
  const integration = config?.integrations?.cleeng?.id ? INTEGRATION_PROVIDER.CLEENG : config?.integrations?.jwp?.clientId ? INTEGRATION_PROVIDER.JW : null;

  initIOCData(integration);

  if (config?.integrations?.cleeng?.id && config?.integrations?.jwp?.clientId) {
    throw new Error('Invalid client integration. You cannot have both Cleeng and JWP integrations enabled at the same time.');
  }

  if (config?.integrations?.cleeng?.id || config?.integrations?.jwp?.clientId) {
    const accountController = useController<AccountController>(CONTROLLERS.Account);
    await accountController.initializeAccount();
  }

  // We only request favorites and continue_watching data if there is a corresponding item in the content section
  // and a playlist in the features section.
  // We first initialize the account otherwise if we have favorites saved as externalData and in a local storage the sections may blink
  if (config.features?.continueWatchingList && config.content.some((el) => el.type === PersonalShelf.ContinueWatching)) {
    const watchHistoryController = useController<WatchHistoryController>(CONTROLLERS.WatchHistory);
    await watchHistoryController.restoreWatchHistory();
  }

  if (config.features?.favoritesList && config.content.some((el) => el.type === PersonalShelf.Favorites)) {
    const favoritesController = useController<FavoritesController>(CONTROLLERS.Favorites);
    await favoritesController.initializeFavorites();
  }

  return config;
};
