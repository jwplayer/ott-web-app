import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import InfiniteScroll from 'react-infinite-scroller';

import styles from './CardGrid.module.scss';

import useBreakpoint, { Breakpoint, Breakpoints } from '#src/hooks/useBreakpoint';
import { isLocked } from '#src/utils/entitlements';
import Card from '#components/Card/Card';
import type { AccessModel } from '#types/Config';
import type { Playlist, PlaylistItem } from '#types/playlist';
import { parseAspectRatio, parseTilesDelta } from '#src/utils/collection';
import InfiniteScrollLoader from '#components/InfiniteScrollLoader/InfiniteScrollLoader';

const INITIAL_ROW_COUNT = 6;
const LOAD_ROWS_COUNT = 4;

const defaultCols: Breakpoints = {
  [Breakpoint.xs]: 2,
  [Breakpoint.sm]: 2,
  [Breakpoint.md]: 3,
  [Breakpoint.lg]: 4,
  [Breakpoint.xl]: 5,
};

type CardGridProps = {
  playlist: Playlist;
  onCardHover?: (item: PlaylistItem) => void;
  onCardClick: (item: PlaylistItem, playlistId?: string) => void;
  watchHistory?: { [key: string]: number };
  isLoading: boolean;
  cols?: Breakpoints;
  currentCardItem?: PlaylistItem;
  currentCardLabel?: string;
  accessModel: AccessModel;
  isLoggedIn: boolean;
  hasSubscription: boolean;
};

function CardGrid({
  playlist,
  onCardClick,
  onCardHover,
  watchHistory,
  isLoading = false,
  cols = defaultCols,
  currentCardItem,
  currentCardLabel,
  accessModel,
  isLoggedIn,
  hasSubscription,
}: CardGridProps) {
  const breakpoint: Breakpoint = useBreakpoint();
  const posterAspect = parseAspectRatio(playlist.shelfImageAspectRatio);
  const visibleTiles = cols[breakpoint] + parseTilesDelta(posterAspect);
  const [rowCount, setRowCount] = useState(INITIAL_ROW_COUNT);

  useEffect(() => {
    // reset row count when the page changes
    setRowCount(INITIAL_ROW_COUNT);
  }, [playlist.feedid]);

  const renderTile = (playlistItem: PlaylistItem) => {
    const { mediaid, title, duration, seriesId, episodeNumber, seasonNumber, shelfImage } = playlistItem;

    return (
      <div className={styles.cell} key={mediaid} role="row">
        <div role="cell">
          <Card
            title={title}
            duration={duration}
            image={shelfImage}
            progress={watchHistory ? watchHistory[mediaid] : undefined}
            seriesId={seriesId}
            episodeNumber={episodeNumber}
            seasonNumber={seasonNumber}
            onClick={() => onCardClick(playlistItem, playlistItem.feedid)}
            onHover={typeof onCardHover === 'function' ? () => onCardHover(playlistItem) : undefined}
            loading={isLoading}
            isCurrent={currentCardItem && currentCardItem.mediaid === mediaid}
            currentLabel={currentCardLabel}
            isLocked={isLocked(accessModel, isLoggedIn, hasSubscription, playlistItem)}
            posterAspect={posterAspect}
          />
        </div>
      </div>
    );
  };

  return (
    <InfiniteScroll
      pageStart={0}
      loadMore={() => setRowCount((current) => current + LOAD_ROWS_COUNT)}
      hasMore={rowCount * visibleTiles < playlist.playlist.length}
      loader={<InfiniteScrollLoader key="loader" />}
    >
      <div className={classNames(styles.container, styles[`cols-${visibleTiles}`])} role="grid">
        {playlist.playlist.slice(0, rowCount * visibleTiles).map(renderTile)}
      </div>
    </InfiniteScroll>
  );
}

export default CardGrid;
