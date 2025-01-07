import { getModule } from '@jwp/ott-common/src/modules/container';
import FavoritesController from '@jwp/ott-common/src/controllers/FavoritesController';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useFavoritesStore } from '@jwp/ott-common/src/stores/FavoritesStore';

import Favorites from '../../../../components/Favorites/Favorites';
import ConfirmationDialog from '../../../../components/ConfirmationDialog/ConfirmationDialog';

const FavoritesSection = () => {
  const favoritesController = getModule(FavoritesController);

  const { accessModel, favoritesList } = useConfigStore(
    (s) => ({
      accessModel: s.accessModel,
      favoritesList: s.config.features?.favoritesList,
    }),
    shallow,
  );
  const { t } = useTranslation('user');
  const [clearFavoritesOpen, setClearFavoritesOpen] = useState(false);

  const { subscription } = useAccountStore();
  const favorites = useFavoritesStore((state) => state.getPlaylist());

  if (!favoritesList) {
    return null;
  }

  return (
    <>
      <Favorites playlist={favorites} onClearFavoritesClick={() => setClearFavoritesOpen(true)} accessModel={accessModel} hasSubscription={!!subscription} />
      <ConfirmationDialog
        open={clearFavoritesOpen}
        title={t('favorites.clear_favorites_title')}
        body={t('favorites.clear_favorites_body')}
        onConfirm={async () => {
          await favoritesController.clear();
          setClearFavoritesOpen(false);
        }}
        onClose={() => setClearFavoritesOpen(false)}
      />
    </>
  );
};

export default FavoritesSection;
