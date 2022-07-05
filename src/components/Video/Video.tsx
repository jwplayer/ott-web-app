import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './Video.module.scss';

import CollapsibleText from '#src/components/CollapsibleText/CollapsibleText';
import Button from '#src/components/Button/Button';
import IconButton from '#src/components/IconButton/IconButton';
import Modal from '#src/components/Modal/Modal';
import Fade from '#src/components/Animation/Fade/Fade';
import Alert from '#src/components/Alert/Alert';
import ModalCloseButton from '#src/components/ModalCloseButton/ModalCloseButton';
import Cinema from '#src/containers/Cinema/Cinema';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import Favorite from '#src/icons/Favorite';
import PlayTrailer from '#src/icons/PlayTrailer';
import Share from '#src/icons/Share';
import Check from '#src/icons/Check';
import ArrowLeft from '#src/icons/ArrowLeft';
import { formatDuration } from '#src/utils/formatting';
import FavoriteBorder from '#src/icons/FavoriteBorder';
import type { PlaylistItem } from '#types/playlist';
import { useFavoritesStore } from '#src/stores/FavoritesStore';

type Poster = 'fading' | 'normal';

type Props = {
  title: string;
  item: PlaylistItem;
  feedId?: string;
  trailerItem?: PlaylistItem;
  play: boolean;
  goBack: () => void;
  onComplete?: () => void;
  isFavorited: boolean;
  isFavoritesEnabled: boolean;
  onFavoriteButtonClick: () => void;
  poster: Poster;
  enableSharing: boolean;
  hasShared: boolean;
  onShareClick: () => void;
  playTrailer: boolean;
  onTrailerClick: () => void;
  onTrailerClose: () => void;
  isSeries?: boolean;
  episodeCount?: number;
  startWatchingButton: JSX.Element;
  children?: JSX.Element;
};

const Video: React.FC<Props> = ({
  title,
  item,
  feedId,
  trailerItem,
  play,
  goBack,
  onComplete,
  poster,
  enableSharing,
  hasShared,
  onShareClick,
  isFavorited,
  isFavoritesEnabled,
  onFavoriteButtonClick,
  children,
  playTrailer,
  onTrailerClick,
  onTrailerClose,
  isSeries = false,
  startWatchingButton,
  episodeCount,
}: Props) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userActive, setUserActive] = useState(true);
  const breakpoint: Breakpoint = useBreakpoint();
  const { t } = useTranslation(['video', 'common']);

  const handleUserActive = useCallback(() => setUserActive(true), []);
  const handleUserInactive = useCallback(() => setUserActive(false), []);
  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleComplete = useCallback(() => onComplete && onComplete(), [onComplete]);

  const { clearWarning, warning } = useFavoritesStore((state) => ({
    clearWarning: state.clearWarning,
    warning: state.warning,
  }));

  const isLargeScreen = breakpoint >= Breakpoint.md;
  const isMobile = breakpoint === Breakpoint.xs;
  const imageSourceWidth = 640 * (window.devicePixelRatio > 1 || isLargeScreen ? 2 : 1);
  const posterImage = item.image.replace('720', imageSourceWidth.toString()); // Todo: should be taken from images (1280 should be sent from API)

  const metaData = [];
  if (item.pubdate) metaData.push(new Date(item.pubdate * 1000).getFullYear());
  if (!isSeries && item.duration) metaData.push(formatDuration(item.duration));
  if (isSeries && episodeCount) metaData.push(t('video:total_episodes', { count: episodeCount }));
  if (item.genre) metaData.push(item.genre);
  if (item.rating) metaData.push(item.rating);
  const metaString = metaData.join(' • ');

  const seriesMeta = isSeries && (
    <>
      <strong>{`S${item.seasonNumber}:E${item.episodeNumber}`}</strong>
      {' - '}
      {item.title}
    </>
  );

  useEffect(() => {
    if (play || playTrailer) setUserActive(true);
  }, [play, playTrailer]);

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
            <div className={styles.meta}>{metaString}</div>
            {isSeries && <div className={styles.seriesMeta}>{seriesMeta}</div>}
          </div>
          <CollapsibleText text={item.description} className={styles.description} maxHeight={isMobile ? 60 : 'none'} />

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
                aria-label={isFavorited ? t('video:remove_from_favorites') : t('video:add_to_favorites')}
                startIcon={isFavorited ? <Favorite /> : <FavoriteBorder />}
                onClick={onFavoriteButtonClick}
                color={isFavorited ? 'primary' : 'default'}
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
        <div className={classNames(styles.poster, styles[poster])} style={{ backgroundImage: `url('${posterImage}')` }} />
      </div>
      {!!children && <div className={classNames(styles.related, styles.mainPadding)}>{children}</div>}
      <Fade open={play}>
        <div className={styles.playerContainer}>
          <div className={styles.player}>
            <Cinema
              item={item}
              feedId={feedId}
              onPlay={handlePlay}
              onPause={handlePause}
              onComplete={handleComplete}
              onUserActive={handleUserActive}
              onUserInActive={handleUserInactive}
            />
          </div>
          <Fade open={!isPlaying || userActive}>
            <div className={styles.playerOverlay}>
              <div className={styles.playerContent}>
                <IconButton aria-label={t('common:back')} onClick={goBack} className={styles.backButton}>
                  <ArrowLeft />
                </IconButton>
                <div>
                  <h2 className={styles.title}>{title}</h2>
                  <div className={styles.metaContainer}>
                    {isSeries && <div className={classNames(styles.seriesMeta, styles.seriesMetaPlayer)}>{seriesMeta}</div>}
                    <div className={styles.meta}>{metaString}</div>
                  </div>
                </div>
              </div>
            </div>
          </Fade>
        </div>
      </Fade>
      <Alert open={warning !== null} message={warning} onClose={clearWarning} />
      {!!trailerItem && (
        <Modal open={playTrailer} onClose={onTrailerClose}>
          <div className={styles.trailerModal}>
            <Cinema
              item={trailerItem}
              onPlay={handlePlay}
              onPause={handlePause}
              onComplete={onTrailerClose}
              onUserActive={handleUserActive}
              onUserInActive={handleUserInactive}
              isTrailer
            />
            <div className={classNames(styles.playerOverlay, { [styles.hidden]: isPlaying && !userActive })} />
            <div className={classNames(styles.trailerMeta, styles.title, { [styles.hidden]: isPlaying && !userActive })}>{`${title} - Trailer`}</div>
            <ModalCloseButton onClick={onTrailerClose} visible={!isPlaying || userActive} />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Video;
