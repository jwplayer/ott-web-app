import React from 'react';
import type { PlaylistItem } from 'types/playlist';
import classNames from 'classnames';

import CollapsibleText from '../CollapsibleText/CollapsibleText';
import Cinema from '../../containers/Cinema/Cinema';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import Favorite from '../../icons/Favorite';
import PlayTrailer from '../../icons/PlayTrailer';
import Share from '../../icons/Share';
import ArrowLeft from '../../icons/ArrowLeft';
import Play from '../../icons/Play';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';

import styles from './Video.module.scss';

type Props = {
  item: PlaylistItem;
  play: boolean;
  startPlay: () => void;
  goBack: () => void;
  posterFading: boolean;
  relatedShelf?: JSX.Element;
};

const Video: React.FC<Props> = ({ item, play, startPlay, goBack, posterFading, relatedShelf }: Props) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const isLargeScreen = breakpoint >= Breakpoint.md;
  const isMobile = breakpoint === Breakpoint.xs;
  const imageSourceWidth = 640 * (window.devicePixelRatio > 1 || isLargeScreen ? 2 : 1);
  const posterImage = item.image.replace('720', imageSourceWidth.toString()); // Todo: should be taken from images (1280 should be sent from API)

  const metaData = [];
  if (item.pubdate) metaData.push(new Date(item.pubdate).getFullYear());
  if (item.duration) metaData.push(`${Math.floor(item.duration / 60)}h ${item.duration % 60}m`);
  if (item.genre) metaData.push(item.genre);
  if (item.rating) metaData.push(item.rating);
  const metaString = metaData.join(' • ');

  //todo: breakpoints not same as css (so info padding-top acts too soon)

  return (
    <div className={styles.video}>
      <div className={styles.main}>
        <div className={styles.info}>
          <h2 className={styles.title}>{item.title}</h2>
          <div className={styles.meta}>{metaString}</div>
          <CollapsibleText text={item.description} className={styles.description} maxHeight={isMobile ? 50 : 'none'} />
          <div className={styles.playButton}>
            <Button
              color="secondary"
              label={'Start watching'}
              startIcon={<Play />}
              onClick={startPlay}
              active={play}
              fullWidth
            />
          </div>
          <div className={styles.otherButtons}>
            <Button label={'Trailer'} startIcon={<PlayTrailer />} onClick={() => null} />
            <Button label={'Favorite'} startIcon={<Favorite />} onClick={() => null} />
            <Button label={'Share'} startIcon={<Share />} onClick={() => null} />
          </div>
        </div>
        <div
          className={classNames(styles.poster, posterFading ? styles.posterFading : styles.posterNormal)}
          style={{ backgroundImage: `url('${posterImage}')` }}
        />
      </div>
      {!!relatedShelf && <div className={styles.other}>{relatedShelf}</div>}
      {play && (
        <div className={styles.playerContainer}>
          <div className={styles.background} style={{ backgroundImage: `url('${item.image}')` }} />
          <div className={styles.player}>
            <Cinema item={item} />
          </div>
          <div className={styles.playerContent}>
            <IconButton aria-label="Back" onClick={goBack}>
              <ArrowLeft />
            </IconButton>
            <div className={styles.playerInfo}>
              <h2 className={styles.title}>{item.title}</h2>
              <div className={styles.meta}>{metaString}</div>
              <div className={styles.description}>{item.description}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Video;
