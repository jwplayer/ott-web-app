import React, { useState } from 'react';
import type { Playlist, PlaylistItem } from 'types/playlist';
import classNames from 'classnames';

import Card from '../Card/Card';
import TileDock from '../TileDock/TileDock';
import useBreakpoint, { Breakpoint, Breakpoints } from '../../hooks/useBreakpoint';
import ArrowLeft from '../../icons/ArrowLeft';
import ArrowRight from '../../icons/ArrowRight';
import { findPlaylistImageForWidth } from '../../utils/collection';

import styles from './Shelf.module.scss';

export const tileBreakpoints: Breakpoints = {
  [Breakpoint.xs]: 1,
  [Breakpoint.sm]: 3,
  [Breakpoint.md]: 4,
  [Breakpoint.lg]: 5,
  [Breakpoint.xl]: 6,
};

export const featuredTileBreakpoints: Breakpoints = {
  [Breakpoint.xs]: 1,
  [Breakpoint.sm]: 1,
  [Breakpoint.md]: 2,
  [Breakpoint.lg]: 2,
  [Breakpoint.xl]: 2,
};

export type ShelfProps = {
  playlist: Playlist | undefined;
  onCardClick: (playlistItem: PlaylistItem) => void;
  onCardHover: (playlistItem: PlaylistItem) => void;
  featured?: boolean;
  loading?: boolean;
};

const placeholderItems = new Array(15).fill({});

const Shelf: React.FC<ShelfProps> = ({
  playlist,
  onCardClick,
  onCardHover,
  featured = false,
  loading = false,
}: ShelfProps) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const [didSlideBefore, setDidSlideBefore] = useState(false);
  const tilesToShow: number = featured ? featuredTileBreakpoints[breakpoint] : tileBreakpoints[breakpoint];
  const isLargeScreen = breakpoint >= Breakpoint.md;
  const imageSourceWidth = (featured ? 640 : 320) * (window.devicePixelRatio > 1 || isLargeScreen ? 2 : 1);

  const handleSlide = (doSlide: () => void): void => {
    setDidSlideBefore(true);
    doSlide();
  };

  if (!playlist) return null;

  return (
    <div className={classNames(styles.shelf, { [styles.featured]: featured })}>
      {!featured && <h2 className={styles['title']}>{loading ? '...' : playlist.title}</h2>}
      <TileDock<PlaylistItem | number>
        items={loading ? placeholderItems : playlist.playlist}
        tilesToShow={tilesToShow}
        cycleMode={'restart'}
        showControls={!matchMedia('(hover: none)').matches}
        transitionTime={loading ? '0s' : '0.3s'}
        spacing={12}
        renderLeftControl={(doSlide) => (
          <div
            className={didSlideBefore ? styles.arrow : styles.arrowDisabled}
            role="button"
            tabIndex={didSlideBefore ? 0 : -1}
            aria-label="Slide left"
            onKeyDown={(event: React.KeyboardEvent) =>
              (event.key === 'Enter' || event.key === ' ') && handleSlide(doSlide)
            }
            onClick={() => handleSlide(doSlide)}
          >
            <ArrowLeft />
          </div>
        )}
        renderRightControl={(doSlide) => (
          <div
            className={styles.arrow}
            role="button"
            tabIndex={0}
            aria-label="Slide right"
            onKeyDown={(event: React.KeyboardEvent) =>
              (event.key === 'Enter' || event.key === ' ') && handleSlide(doSlide)
            }
            onClick={() => handleSlide(doSlide)}
          >
            <ArrowRight />
          </div>
        )}
        renderTile={(item, isInView) => {
          if (loading || typeof item === 'number') {
            return <Card title={'...'} duration={0} featured={featured} />;
          }

          return (
            <Card
              title={item.title}
              duration={item.duration}
              posterSource={findPlaylistImageForWidth(item, imageSourceWidth)}
              seriesId={item.seriesId}
              onClick={() => (isInView ? onCardClick(item) : null)}
              onHover={() => onCardHover(item)}
              featured={featured}
              disabled={!isInView}
            />
          );
        }}
      />
    </div>
  );
};

export default Shelf;
