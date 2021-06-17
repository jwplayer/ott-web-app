import React, { useState } from 'react';
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

import styles from './Video.module.scss';

type Poster = 'fading' | 'normal';

type Props = {
  title: string;
  item: PlaylistItem;
  trailerItem?: PlaylistItem;
  play: boolean;
  startPlay: () => void;
  goBack: () => void;
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
  children?: JSX.Element;
};

const Video: React.FC<Props> = ({
  title,
  item,
  trailerItem,
  play,
  startPlay,
  goBack,
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
}: Props) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mouseActive, setMouseActive] = useState(false);
  const breakpoint: Breakpoint = useBreakpoint();
  const { t } = useTranslation(['video', 'common']);
  const isLargeScreen = breakpoint >= Breakpoint.md;
  const isMobile = breakpoint === Breakpoint.xs;
  const imageSourceWidth = 640 * (window.devicePixelRatio > 1 || isLargeScreen ? 2 : 1);
  const posterImage = item.image.replace('720', imageSourceWidth.toString()); // Todo: should be taken from images (1280 should be sent from API)

  const metaData = [];
  if (item.pubdate) metaData.push(new Date(item.pubdate).getFullYear());
  if (item.duration) metaData.push(formatDuration(item.duration));
  if (item.genre) metaData.push(item.genre);
  if (item.rating) metaData.push(item.rating);
  const metaString = metaData.join(' • ');

  const seriesMeta = isSeries ? `S${item.seasonNumber}:E${item.episodeNumber}` : null;

  let timeout: NodeJS.Timeout;
  const mouseActivity = () => {
    setMouseActive(true);
    clearTimeout(timeout);
    timeout = setTimeout(() => setMouseActive(false), 2000);
  };

  const metaContent = (
    <>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.metaContainer}>
        <div className={styles.meta}>{metaString}</div>
        {isSeries && (
          <div className={styles.seriesMeta}>
            <strong>{seriesMeta}</strong>
            {' - '}
            {item.title}
          </div>
        )}
      </div>
      <CollapsibleText text={item.description} className={styles.description} maxHeight={isMobile ? 50 : 'none'} />
    </>
  );

  return (
    <div className={styles.video}>
      <div
        className={classNames(styles.main, styles.mainPadding, {
          [styles.hidden]: play,
          [styles.posterNormal]: poster === 'normal',
        })}
      >
        <div className={styles.info}>
          {metaContent}
          <div className={styles.playButton}>
            <Button
              color="primary"
              variant="contained"
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
        <div
          className={classNames(styles.poster, styles[poster])}
          style={{ backgroundImage: `url('${posterImage}')` }}
        />
      </div>
      {!!children && <div className={classNames(styles.related, styles.mainPadding)}>{children}</div>}
      {play && (
        <div className={styles.playerContainer} onMouseMove={mouseActivity} onClick={mouseActivity}>
          <div className={styles.player}>
            <Cinema item={item} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
          </div>
          <div className={classNames(styles.playerContent, { [styles.hidden]: isPlaying && !mouseActive })}>
            <IconButton aria-label={t('common:back')} onClick={goBack}>
              <ArrowLeft />
            </IconButton>
            <div className={styles.playerInfo}>{metaContent}</div>
          </div>
        </div>
      )}
      {playTrailer && trailerItem && (
        <Modal onClose={onTrailerClose}>
          <div onMouseMove={mouseActivity} onClick={mouseActivity}>
            <Cinema item={trailerItem} onComplete={onTrailerClose} isTrailer />
            <div
              className={classNames(styles.trailerMeta, styles.title, { [styles.hidden]: !mouseActive })}
            >{`${title} - Trailer`}</div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Video;
