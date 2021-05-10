import React from 'react';
import type { Playlist, PlaylistItem } from 'types/playlist';
import classNames from 'classnames';

import Card from '../Card/Card';
import TileDock from '../TileDock/TileDock';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import ArrowLeft from '../../icons/ArrowLeft';
import ArrowRight from '../../icons/ArrowRight';

import styles from './Shelf.module.scss';

export const tileBreakpoints = {
  [Breakpoint.xs]: 1,
  [Breakpoint.sm]: 1,
  [Breakpoint.md]: 2,
  [Breakpoint.lg]: 5,
  [Breakpoint.xl]: 6,
};

export const featuredTileBreakpoints = {
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
  const tilesToShow: number = featured ? featuredTileBreakpoints[breakpoint] : tileBreakpoints[breakpoint];

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
        renderLeftControl={(handleClick) => (
          <div className={styles.arrow} onClick={handleClick}>
            <ArrowLeft />
          </div>
        )}
        renderRightControl={(handleClick) => (
          <div className={styles.arrow} onClick={handleClick}>
            <ArrowRight />
          </div>
        )}
        renderTile={(item) => {
          if (loading || typeof item === 'number') {
            return <Card title={'...'} duration={0} featured={featured} />;
          }

          return (
            <Card
              title={item.title}
              duration={item.duration}
              posterSource={item.image}
              onClick={() => onCardClick(item)}
              onHover={() => onCardHover(item)}
              featured={featured}
            />
          );
        }}
      />
    </div>
  );
};

export default Shelf;
