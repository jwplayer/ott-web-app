import React, { useState, useEffect, useCallback } from 'react';
import type { PlaylistItem } from 'types/playlist';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import CollapsibleText from '../CollapsibleText/CollapsibleText';
import Cinema from '../../containers/Cinema/Cinema';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import Favorite from '../../icons/Favorite';
import PlayTrailer from '../../icons/PlayTrailer';
import Share from '../../icons/Share';
import Check from '../../icons/Check';
import ArrowLeft from '../../icons/ArrowLeft';
import Play from '../../icons/Play';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import { formatDuration } from '../../utils/formatting';
import Modal from '../Modal/Modal';
import FavoriteBorder from '../../icons/FavoriteBorder';
import Fade from '../Animation/Fade/Fade';

import styles from './Video.module.scss';

type Poster = 'fading' | 'normal';

type Props = {
  title: string;
  item: PlaylistItem;
  feedId?: string;
  trailerItem?: PlaylistItem;
  play: boolean;
  startPlay: () => void;
  goBack: () => void;
  onComplete?: () => void;
  isFavorited: boolean;
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
  children?: JSX.Element;
};

const Video: React.FC<Props> = ({
  title,
  item,
  feedId,
  trailerItem,
  play,
  startPlay,
  goBack,
  onComplete,
  poster,
  enableSharing,
  hasShared,
  onShareClick,
  isFavorited,
  onFavoriteButtonClick,
  children,
  playTrailer,
  onTrailerClick,
  onTrailerClose,
  isSeries = false,
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
          <div className={styles.playButton}>
            <Button
              color="primary"
              variant="contained"
              size="large"
              label={t('video:start_watching')}
              startIcon={<Play />}
              onClick={startPlay}
              active={play}
              fullWidth
            />
          </div>
          <div className={styles.otherButtons}>
            {trailerItem && (
              <Button
                label={t('video:trailer')}
                aria-label={t('video:watch_trailer')}
                startIcon={<PlayTrailer />}
                onClick={onTrailerClick}
                active={playTrailer}
                fullWidth={breakpoint < Breakpoint.sm}
              />
            )}
            <Button
              label={t('video:favorite')}
              aria-label={isFavorited ? t('video:remove_from_favorites') : t('video:add_to_favorites')}
              startIcon={isFavorited ? <Favorite /> : <FavoriteBorder />}
              onClick={onFavoriteButtonClick}
              color={isFavorited ? 'primary' : 'default'}
            />
            {enableSharing && (
              <Button
                label={hasShared ? t('video:copied_url') : t('video:share')}
                startIcon={hasShared ? <Check /> : <Share />}
                onClick={onShareClick}
                active={hasShared}
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
      {!!trailerItem && (
        <Modal open={playTrailer} onClose={onTrailerClose} closeButtonVisible={!isPlaying || userActive}>
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
          <div
            className={classNames(styles.trailerMeta, styles.title, { [styles.hidden]: isPlaying && !userActive })}
          >{`${title} - Trailer`}</div>
        </Modal>
      )}
    </div>
  );
};

export default Video;
