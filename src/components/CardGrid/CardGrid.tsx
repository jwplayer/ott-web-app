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
  watchHistory?: { [key: string]: number };
  isLoading: boolean;
  cols?: Breakpoints;
  currentCardItem?: PlaylistItem;
  currentCardLabel?: string;
  accessModel: AccessModel;
  isLoggedIn: boolean;
  hasSubscription: boolean;
  hasLoadMore?: boolean;
  loadMore?: () => void;
  onCardHover?: (item: PlaylistItem) => void;
  getUrl: (item: PlaylistItem) => string;
};

function CardGrid({
  playlist,
  watchHistory,
  isLoading = false,
  cols = defaultCols,
  currentCardItem,
  currentCardLabel,
  accessModel,
  isLoggedIn,
  hasSubscription,
  hasLoadMore,
  getUrl,
  loadMore,
  onCardHover,
}: CardGridProps) {
  const breakpoint: Breakpoint = useBreakpoint();
  const posterAspect = parseAspectRatio(playlist.cardImageAspectRatio || playlist.shelfImageAspectRatio);
  const visibleTiles = cols[breakpoint] + parseTilesDelta(posterAspect);
  const [rowCount, setRowCount] = useState(INITIAL_ROW_COUNT);

  const defaultLoadMore = () => setRowCount((current) => current + LOAD_ROWS_COUNT);
  const defaultHasMore = rowCount * visibleTiles < playlist.playlist.length;

  useEffect(() => {
    // reset row count when the page changes
    setRowCount(INITIAL_ROW_COUNT);
  }, [playlist.feedid]);

  const renderTile = (playlistItem: PlaylistItem) => {
    const { mediaid } = playlistItem;

    return (
      <div className={styles.cell} key={mediaid} role="row">
        <div role="cell">
          <Card
            progress={watchHistory ? watchHistory[mediaid] : undefined}
            url={getUrl(playlistItem)}
            onHover={typeof onCardHover === 'function' ? () => onCardHover(playlistItem) : undefined}
            loading={isLoading}
            isCurrent={currentCardItem && currentCardItem.mediaid === mediaid}
            currentLabel={currentCardLabel}
            isLocked={isLocked(accessModel, isLoggedIn, hasSubscription, playlistItem)}
            posterAspect={posterAspect}
            item={playlistItem}
          />
        </div>
      </div>
    );
  };

  return (
    <InfiniteScroll pageStart={0} loadMore={loadMore || defaultLoadMore} hasMore={hasLoadMore || defaultHasMore} loader={<InfiniteScrollLoader key="loader" />}>
      <div className={classNames(styles.container, styles[`cols-${visibleTiles}`])} role="grid">
        {playlist.playlist.slice(0, rowCount * visibleTiles).map(renderTile)}
      </div>
    </InfiniteScroll>
  );
}

export default CardGrid;
