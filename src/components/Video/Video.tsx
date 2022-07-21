import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './Video.module.scss';

import CollapsibleText from '#src/components/CollapsibleText/CollapsibleText';
import Button from '#src/components/Button/Button';
import Alert from '#src/components/Alert/Alert';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import Favorite from '#src/icons/Favorite';
import PlayTrailer from '#src/icons/PlayTrailer';
import Share from '#src/icons/Share';
import Check from '#src/icons/Check';
import FavoriteBorder from '#src/icons/FavoriteBorder';
import type { PlaylistItem } from '#types/playlist';
import { useFavoritesStore } from '#src/stores/FavoritesStore';

type PosterMode = 'fading' | 'normal';

type Props = {
  title: string;
  description: string;
  videoMeta: string;
  seriesMeta?: string;
  episodeTitle?: string;
  trailerItem?: PlaylistItem;
  isFavorite: boolean;
  isFavoritesEnabled: boolean;
  onFavoriteButtonClick: () => void;
  poster?: string;
  posterMode: PosterMode;
  enableSharing: boolean;
  hasShared: boolean;
  onShareClick: () => void;
  onTrailerClick: () => void;
  onTrailerClose: () => void;
  playTrailer: boolean;
  isSeries?: boolean;
  startWatchingButton: JSX.Element;
  children?: JSX.Element;
};

const Video: React.FC<Props> = ({
  title,
  description,
  videoMeta,
  seriesMeta,
  episodeTitle,
  trailerItem,
  poster,
  posterMode,
  enableSharing,
  hasShared,
  onShareClick,
  isFavorite,
  isFavoritesEnabled,
  onFavoriteButtonClick,
  children,
  playTrailer,
  onTrailerClick,
  isSeries = false,
  startWatchingButton,
}: Props) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const { t } = useTranslation(['video', 'common']);

  const { clearWarning, warning } = useFavoritesStore((state) => ({
    clearWarning: state.clearWarning,
    warning: state.warning,
  }));

  const isMobile = breakpoint === Breakpoint.xs;

  return (
    <div className={styles.video}>
      <div
        className={classNames(styles.main, styles.mainPadding, {
          [styles.posterNormal]: poster === 'normal',
        })}
      >
        <div className={styles.info}>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.metaContainer}>
            <div className={styles.meta}>{videoMeta}</div>
            {isSeries && (
              <div className={styles.seriesMeta}>
                <strong>{seriesMeta}</strong> - {episodeTitle}
              </div>
            )}
          </div>
          <CollapsibleText text={description} className={styles.description} maxHeight={isMobile ? 60 : 'none'} />

          <div className={styles.buttonBar}>
            {startWatchingButton}
            {trailerItem && (
              <Button
                className={styles.bigButton}
                label={t('video:trailer')}
                aria-label={t('video:watch_trailer')}
                startIcon={<PlayTrailer />}
                onClick={onTrailerClick}
                active={playTrailer}
                fullWidth={breakpoint < Breakpoint.md}
              />
            )}
            {isFavoritesEnabled && (
              <Button
                label={t('video:favorite')}
                aria-label={isFavorite ? t('video:remove_from_favorites') : t('video:add_to_favorites')}
                startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
                onClick={onFavoriteButtonClick}
                color={isFavorite ? 'primary' : 'default'}
                fullWidth={breakpoint < Breakpoint.md}
              />
            )}
            {enableSharing && (
              <Button
                label={hasShared ? t('video:copied_url') : t('video:share')}
                startIcon={hasShared ? <Check /> : <Share />}
                onClick={onShareClick}
                active={hasShared}
                fullWidth={breakpoint < Breakpoint.md}
              />
            )}
          </div>
        </div>
        <div className={classNames(styles.poster, styles[posterMode])} style={{ backgroundImage: `url('${poster}')` }} />
      </div>
      {!!children && <div className={classNames(styles.related, styles.mainPadding)}>{children}</div>}
      <Alert open={warning !== null} message={warning} onClose={clearWarning} />
    </div>
  );
};

export default Video;
