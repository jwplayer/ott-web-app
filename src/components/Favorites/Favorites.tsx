import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { ConfigContext } from '../../providers/ConfigProvider';
import Button from '../Button/Button';
import CardGrid from '../CardGrid/CardGrid';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import ErrorPage from '../ErrorPage/ErrorPage';
import { Breakpoint, Breakpoints } from '../../hooks/useBreakpoint';

import styles from './Favorites.module.scss';

import type { AccessModel, Config } from '#types/Config';
import type { PlaylistItem } from '#types/playlist';

type Props = {
  playlist: PlaylistItem[];
  error: unknown;
  isLoading: boolean;
  accessModel: AccessModel;
  hasSubscription: boolean;
  onCardClick: (item: PlaylistItem) => void;
  onCardHover: (item: PlaylistItem) => void;
  onClearFavoritesClick: () => void;
};

const cols: Breakpoints = {
  [Breakpoint.xs]: 2,
  [Breakpoint.sm]: 3,
  [Breakpoint.md]: 3,
  [Breakpoint.lg]: 3,
  [Breakpoint.xl]: 3,
};

const Favorites = ({ playlist, error, isLoading, accessModel, hasSubscription, onCardClick, onCardHover, onClearFavoritesClick }: Props): JSX.Element => {
  const { t } = useTranslation('user');
  const config: Config = useContext(ConfigContext);

  if (isLoading) return <LoadingOverlay />;

  if (error || !playlist) {
    return <ErrorPage title={t('favorites.not_found')} />;
  }

  return (
    <div>
      <div className={styles.header}>
        <h3>{t('favorites.title')}</h3>
        {playlist.length > 0 ? <Button label={t('favorites.clear')} onClick={onClearFavoritesClick} /> : null}
      </div>
      {playlist.length > 0 ? (
        <CardGrid
          playlist={playlist}
          onCardClick={onCardClick}
          onCardHover={onCardHover}
          cols={cols}
          isLoading={isLoading}
          enableCardTitles={config.styling.shelfTitles}
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
