import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '#src/components/Button/Button';
import Favorite from '#src/icons/Favorite';
import FavoriteBorder from '#src/icons/FavoriteBorder';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import type { PlaylistItem } from '#types/playlist';
import { toggleFavorite } from '#src/stores/FavoritesController';
import { useFavoritesStore } from '#src/stores/FavoritesStore';

type Props = {
  item: PlaylistItem;
};

const FavoriteButton: React.VFC<Props> = ({ item }) => {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();

  const { isFavorite } = useFavoritesStore((state) => ({
    isFavorite: !!item && state.hasItem(item),
  }));

  const onFavoriteButtonClick = useCallback(() => {
    toggleFavorite(item);
  }, [item]);

  return (
    <Button
      label={t('video:favorite')}
      aria-label={isFavorite ? t('video:remove_from_favorites') : t('video:add_to_favorites')}
      startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
      onClick={onFavoriteButtonClick}
      color={isFavorite ? 'primary' : 'default'}
      fullWidth={breakpoint < Breakpoint.md}
    />
  );
};

export default FavoriteButton;
