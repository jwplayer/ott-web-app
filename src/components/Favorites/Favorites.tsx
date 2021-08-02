import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlaylistItem } from 'types/playlist';
import type { Config } from 'types/Config';

import { ConfigContext } from '../../providers/ConfigProvider';
import Button from '../Button/Button';
import CardGrid from '../CardGrid/CardGrid';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import ErrorPage from '../ErrorPage/ErrorPage';
import { Breakpoint, Breakpoints } from '../../hooks/useBreakpoint';

import styles from './Favorites.module.scss';

type Props = {
  playlist: PlaylistItem[];
  error: unknown;
  isLoading: boolean;
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

const Favorites = ({ playlist, error, isLoading, onCardClick, onCardHover, onClearFavoritesClick }: Props): JSX.Element => {
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
          enableCardTitles={config.options.shelveTitles}
          hasActiveSubscription={true}
          requiresSubscription={true}
        />
      ) : (
        <p>{t('favorites.no_favorites')}</p>
      )}
    </div>
  );
};

export default Favorites;
