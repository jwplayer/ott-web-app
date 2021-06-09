import React, { useState } from 'react';
import type { Playlist, PlaylistItem } from 'types/playlist';
import classNames from 'classnames';

import Card from '../Card/Card';
import TileDock from '../TileDock/TileDock';
import useBreakpoint, { Breakpoint, Breakpoints } from '../../hooks/useBreakpoint';
import ChevronLeft from '../../icons/ChevronLeft';
import ChevronRight from '../../icons/ChevronRight';
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
  [Breakpoint.md]: 1,
  [Breakpoint.lg]: 1,
  [Breakpoint.xl]: 1,
};

export type ShelfProps = {
  playlist: Playlist;
  onCardClick: (playlistItem: PlaylistItem) => void;
  onCardHover: (playlistItem: PlaylistItem) => void;
  featured?: boolean;
  loading?: boolean;
  error?: unknown;
};

const Shelf: React.FC<ShelfProps> = ({
  playlist,
  onCardClick,
  onCardHover,
  featured = false,
  loading = false,
  error = null,
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

  if (error) return <h2 className={styles.error}>Could not load items</h2>;

  return (
    <div className={classNames(styles.shelf, { [styles.featured]: featured })}>
      {!featured && <h2 className={classNames(styles.title, { [styles.loading]: loading })}>{playlist.title}</h2>}
      <TileDock<PlaylistItem>
        items={playlist.playlist}
        tilesToShow={tilesToShow}
        cycleMode={'restart'}
        showControls={!matchMedia('(hover: none)').matches && !loading}
        transitionTime={'0.3s'}
        spacing={8}
        renderLeftControl={(doSlide) => (
          <div
            className={classNames(styles.chevron, {
              [styles.disabled]: !didSlideBefore,
              [styles.featuredLeftCorrection]: featured && isLargeScreen,
            })}
            role="button"
            tabIndex={didSlideBefore ? 0 : -1}
            aria-label="Slide left"
            onKeyDown={(event: React.KeyboardEvent) =>
              (event.key === 'Enter' || event.key === ' ') && handleSlide(doSlide)
            }
            onClick={() => handleSlide(doSlide)}
          >
            <ChevronLeft />
          </div>
        )}
        renderRightControl={(doSlide) => (
          <div
            className={classNames(styles.chevron, {
              [styles.featuredRightCorrection]: featured && isLargeScreen,
            })}
            role="button"
            tabIndex={0}
            aria-label="Slide right"
            onKeyDown={(event: React.KeyboardEvent) =>
              (event.key === 'Enter' || event.key === ' ') && handleSlide(doSlide)
            }
            onClick={() => handleSlide(doSlide)}
          >
            <ChevronRight />
          </div>
        )}
        renderTile={(item, isInView) => (
          <Card
            title={item.title}
            duration={item.duration}
            posterSource={findPlaylistImageForWidth(item, imageSourceWidth)}
            seriesId={item.seriesId}
            onClick={() => (isInView ? onCardClick(item) : null)}
            onHover={() => onCardHover(item)}
            featured={featured}
            disabled={!isInView}
            loading={loading}
          />
        )}
      />
    </div>
  );
};

export default Shelf;
