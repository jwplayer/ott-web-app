import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useFavoritesStore } from '@jwp/ott-common/src/stores/FavoritesStore';
import FavoritesController from '@jwp/ott-common/src/controllers/FavoritesController';
import Favorite from '@jwp/ott-theme/assets/icons/favorite.svg?react';
import FavoriteBorder from '@jwp/ott-theme/assets/icons/favorite_border.svg?react';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';

import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import Icon from '../../components/Icon/Icon';

type Props = {
  item: PlaylistItem;
};

const FavoriteButton: React.VFC<Props> = ({ item }) => {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();
  const favoritesController = getModule(FavoritesController);

  const { isFavorite, clearWarning, warning } = useFavoritesStore((state) => ({
    isFavorite: !!item && state.hasItem(item),
    clearWarning: state.clearWarning,
    warning: state.warning,
  }));

  const onFavoriteButtonClick = useCallback(async () => {
    await favoritesController.toggleFavorite(item);
  }, [item, favoritesController]);

  useEffect(() => {
    // clear warning on unmount (probably by navigating away from the page using the back button)
    return () => clearWarning();
  }, [clearWarning]);

  return (
    <>
      <Button
        label={t('video:favorite')}
        aria-label={t('video:favorite')}
        startIcon={isFavorite ? <Icon icon={Favorite} /> : <Icon icon={FavoriteBorder} />}
        onClick={onFavoriteButtonClick}
        aria-pressed={isFavorite}
        color={isFavorite ? 'primary' : 'default'}
        fullWidth={breakpoint < Breakpoint.md}
      />
      <Alert open={warning !== null} message={warning} onClose={clearWarning} />
    </>
  );
};

export default FavoriteButton;
