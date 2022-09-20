import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../Button/Button';
import CardGrid from '../CardGrid/CardGrid';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import ErrorPage from '../ErrorPage/ErrorPage';

import styles from './Favorites.module.scss';

import { Breakpoint, Breakpoints } from '#src/hooks/useBreakpoint';
import type { AccessModel } from '#types/Config';
import type { Playlist, PlaylistItem } from '#types/playlist';

type Props = {
  playlist: Playlist;
  error: unknown;
  isLoading: boolean;
  accessModel: AccessModel;
  hasSubscription: boolean;
  shelfTitles?: boolean;
  onCardClick: (item: PlaylistItem) => void;
  onCardHover: (item: PlaylistItem) => void;
  onClearFavoritesClick: () => void;
  getCardImages: (item: PlaylistItem, playlist: Playlist, width: number) => string[];
};

const cols: Breakpoints = {
  [Breakpoint.xs]: 2,
  [Breakpoint.sm]: 3,
  [Breakpoint.md]: 3,
  [Breakpoint.lg]: 3,
  [Breakpoint.xl]: 3,
};

const Favorites = ({
  playlist,
  error,
  isLoading,
  shelfTitles,
  accessModel,
  hasSubscription,
  onCardClick,
  onCardHover,
  onClearFavoritesClick,
  getCardImages,
}: Props): JSX.Element => {
  const { t } = useTranslation('user');

  if (isLoading) return <LoadingOverlay />;

  if (error || !playlist) {
    return <ErrorPage title={t('favorites.not_found')} />;
  }

  return (
    <div>
      <div className={styles.header}>
        <h3>{t('favorites.title')}</h3>
        {playlist.playlist.length > 0 ? <Button label={t('favorites.clear')} onClick={onClearFavoritesClick} /> : null}
      </div>
      {playlist.playlist.length > 0 ? (
        <CardGrid
          playlist={playlist}
          onCardClick={onCardClick}
          onCardHover={onCardHover}
          getCardImages={getCardImages}
          cols={cols}
          isLoading={isLoading}
          enableCardTitles={shelfTitles}
          accessModel={accessModel}
          isLoggedIn={true}
          hasSubscription={hasSubscription}
        />
      ) : (
        <p>{t('favorites.no_favorites')}</p>
      )}
    </div>
  );
};

export default Favorites;
