import React from 'react';
import type { Playlist, PlaylistItem } from 'types/playlist';
import classNames from 'classnames';

import Card from '../Card/Card';
import TileDock from '../TileDock/TileDock';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';

import styles from './Shelf.module.scss';

const tileBreakpoints = {
  [Breakpoint.xs]: 1,
  [Breakpoint.sm]: 3,
  [Breakpoint.md]: 4,
  [Breakpoint.lg]: 5,
  [Breakpoint.xl]: 6,
};

export type ShelfProps = {
  playlist: Playlist | undefined;
  onCardClick: (playlistItem: PlaylistItem) => void;
  onCardHover: (playlistItem: PlaylistItem) => void;
  featured?: boolean;
};

const Shelf: React.FC<ShelfProps> = ({ playlist, onCardClick, onCardHover, featured = false }: ShelfProps) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const tilesToShow: number = featured ? 1 : tileBreakpoints[breakpoint];

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
          <button className={classNames(styles['arrowButton'], styles['arrowLeft'])} onClick={handleClick}>
            &lt;
          </button>
        )}
        renderRightControl={(handleClick) => (
          <button className={classNames(styles['arrowButton'], styles['arrowRight'])} onClick={handleClick}>
            &gt;
          </button>
        )}
        renderTile={(item) => {
          const playlistItem = item as PlaylistItem;
          return (
            <Card
              key={playlistItem.mediaid}
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
