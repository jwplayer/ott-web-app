import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './VideoDetails.module.scss';

import CollapsibleText from '#src/components/CollapsibleText/CollapsibleText';
import Button from '#src/components/Button/Button';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import Favorite from '#src/icons/Favorite';
import PlayTrailer from '#src/icons/PlayTrailer';
import FavoriteBorder from '#src/icons/FavoriteBorder';

type PosterMode = 'fading' | 'normal';

type Props = {
  title: string;
  description: string;
  primaryMetadata: React.ReactNode;
  secondaryMetadata?: React.ReactNode;
  isFavorite: boolean;
  isFavoritesEnabled: boolean;
  onFavoriteButtonClick: () => void;
  poster?: string;
  posterMode: PosterMode;
  hasTrailer: boolean;
  onTrailerClick: () => void;
  playTrailer: boolean;
  startWatchingButton: React.ReactNode;
  shareButton: React.ReactNode;
};

const VideoDetails: React.FC<Props> = ({
  title,
  description,
  primaryMetadata,
  secondaryMetadata,
  poster,
  posterMode,
  isFavorite,
  isFavoritesEnabled,
  onFavoriteButtonClick,
  children,
  hasTrailer,
  playTrailer,
  onTrailerClick,
  startWatchingButton,
  shareButton,
}) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const { t } = useTranslation(['video', 'common']);

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
            <div className={styles.primaryMetadata}>{primaryMetadata}</div>
            {secondaryMetadata && <div className={styles.secondaryMetadata}>{secondaryMetadata}</div>}
          </div>
          <CollapsibleText text={description} className={styles.description} maxHeight={isMobile ? 60 : 'none'} />

          <div className={styles.buttonBar}>
            {startWatchingButton}
            {hasTrailer && (
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
            {shareButton}
          </div>
        </div>
        <div className={classNames(styles.poster, styles[posterMode])} style={{ backgroundImage: `url('${poster}')` }} />
      </div>
      {!!children && <div className={classNames(styles.related, styles.mainPadding)}>{children}</div>}
    </div>
  );
};

export default VideoDetails;
