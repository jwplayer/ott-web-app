import React from 'react';
import type { Playlist, PlaylistItem } from 'types/playlist';

import Card from '../Card/Card';
import TileDock from '../TileDock/TileDock';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import ArrowLeft from '../../icons/ArrowLeft';
import ArrowRight from '../../icons/ArrowRight';

import styles from './Shelf.module.scss';

export const tileBreakpoints = {
  [Breakpoint.xs]: 1,
  [Breakpoint.sm]: 3,
  [Breakpoint.md]: 4,
  [Breakpoint.lg]: 5,
  [Breakpoint.xl]: 6,
};

export const featuredTileBreakpoints = {
  [Breakpoint.xs]: 1,
  [Breakpoint.sm]: 2,
  [Breakpoint.md]: 2,
  [Breakpoint.lg]: 2,
  [Breakpoint.xl]: 2,
};

export type ShelfProps = {
  playlist: Playlist | undefined;
  onCardClick: (playlistItem: PlaylistItem) => void;
  onCardHover: (playlistItem: PlaylistItem) => void;
  featured?: boolean;
};

const Shelf: React.FC<ShelfProps> = ({ playlist, onCardClick, onCardHover, featured = false }: ShelfProps) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const tilesToShow: number = featured ? featuredTileBreakpoints[breakpoint] : tileBreakpoints[breakpoint];

  if (!playlist) return null;

  return (
    <div className={styles['Shelf']}>
      {!featured && <h2 className={styles['title']}>{playlist.title}</h2>}
      <TileDock
        items={playlist.playlist}
        tilesToShow={tilesToShow}
        cycleMode={'restart'}
        transitionTime="0.3s"
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
          const playlistItem = item as PlaylistItem;
          return (
            <Card
              title={playlistItem.title}
              duration={playlistItem.duration}
              posterSource={playlistItem.image}
              onClick={() => onCardClick(playlistItem)}
              onHover={() => onCardHover(playlistItem)}
              featured={featured}
            />
          );
        }}
      />
    </div>
  );
};

export default Shelf;
