import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '#components/Button/Button';
import Favorite from '#src/icons/Favorite';
import FavoriteBorder from '#src/icons/FavoriteBorder';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import type { PlaylistItem } from '#types/playlist';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import Alert from '#components/Alert/Alert';
import FavoritesController from '#src/stores/FavoritesController';
import { getModule } from '#src/modules/container';

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
        aria-label={isFavorite ? t('video:remove_from_favorites') : t('video:add_to_favorites')}
        startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
        onClick={onFavoriteButtonClick}
        color={isFavorite ? 'primary' : 'default'}
        fullWidth={breakpoint < Breakpoint.md}
      />
      <Alert open={warning !== null} message={warning} onClose={clearWarning} />
    </>
  );
};

export default FavoriteButton;
