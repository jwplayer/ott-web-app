import React from 'react';
import type { GridCellProps } from 'react-virtualized';

import type { PlaylistItem } from '../../../types/playlist';
import VirtualizedGrid from '../VirtualizedGrid/VirtualizedGrid';
import Card from '../Card/Card';
import useBreakpoint, { Breakpoint, Breakpoints } from '../../hooks/useBreakpoint';
import { chunk, findPlaylistImageForWidth } from '../../utils/collection';

import styles from './CardGrid.module.scss';

const defaultCols: Breakpoints = {
  [Breakpoint.xs]: 2,
  [Breakpoint.sm]: 2,
  [Breakpoint.md]: 3,
  [Breakpoint.lg]: 4,
  [Breakpoint.xl]: 5,
};

type CardGridProps = {
  playlist: PlaylistItem[];
  onCardHover?: (item: PlaylistItem) => void;
  onCardClick: (item: PlaylistItem) => void;
  isLoading: boolean;
  cols?: Breakpoints;
  currentCardItem?: PlaylistItem;
  currentCardLabel?: string;
};

function CardGrid({
  playlist,
  onCardClick,
  onCardHover,
  isLoading = false,
  cols = defaultCols,
  currentCardItem,
  currentCardLabel,
}: CardGridProps) {
  const breakpoint: Breakpoint = useBreakpoint();
  const isLargeScreen = breakpoint >= Breakpoint.md;
  const imageSourceWidth = 320 * (window.devicePixelRatio > 1 || isLargeScreen ? 2 : 1);
  const rows = chunk<PlaylistItem>(playlist, cols[breakpoint]);

  const cellRenderer = ({ columnIndex, rowIndex, style }: GridCellProps) => {
    if (!rows[rowIndex][columnIndex]) return;

    const playlistItem: PlaylistItem = rows[rowIndex][columnIndex];
    const { mediaid, title, duration, seriesId } = playlistItem;

    return (
      <div className={styles.cell} style={style} key={mediaid}>
        <Card
          key={mediaid}
          title={title}
          duration={duration}
          posterSource={findPlaylistImageForWidth(playlistItem, imageSourceWidth)}
          seriesId={seriesId}
          onClick={() => onCardClick(playlistItem)}
          onHover={typeof onCardHover === 'function' ? () => onCardHover(playlistItem) : undefined}
          loading={isLoading}
          isCurrent={currentCardItem && currentCardItem.mediaid === mediaid}
          currentLabel={currentCardLabel}
        />
      </div>
    );
  };

  return <VirtualizedGrid rowCount={rows.length} cols={cols} cellRenderer={cellRenderer} spacing={50} />;
}

export default CardGrid;
