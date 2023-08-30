import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import shallow from 'zustand/shallow';
import InfiniteScroll from 'react-infinite-scroller';

import styles from './ShelfList.module.scss';

import PlaylistContainer from '#src/containers/PlaylistContainer/PlaylistContainer';
import { useAccountStore } from '#src/stores/AccountStore';
import { PersonalShelf, useConfigStore } from '#src/stores/ConfigStore';
import ShelfComponent from '#components/Shelf/Shelf';
import { slugify } from '#src/utils/formatting';
import type { Content } from '#types/Config';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { parseAspectRatio, parseTilesDelta } from '#src/utils/collection';
import InfiniteScrollLoader from '#components/InfiniteScrollLoader/InfiniteScrollLoader';
import { testId } from '#src/utils/common';

const INITIAL_ROW_COUNT = 6;
const LOAD_ROWS_COUNT = 4;

type Props = {
  rows: Content[];
};

const ShelfList = ({ rows }: Props) => {
  const { accessModel } = useConfigStore(({ accessModel }) => ({ accessModel }), shallow);
  const [rowCount, setRowCount] = useState(INITIAL_ROW_COUNT);

  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionaryWithSeries());

  // User
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);

  useEffect(() => {
    // reset row count when the page changes
    return () => setRowCount(INITIAL_ROW_COUNT);
  }, [rows]);

  return (
    <div className={styles.home}>
      <InfiniteScroll
        pageStart={0}
        style={{ overflow: 'hidden' }}
        loadMore={() => setRowCount((current) => current + LOAD_ROWS_COUNT)}
        hasMore={rowCount < rows.length}
        role="grid"
        loader={<InfiniteScrollLoader key="loader" />}
      >
        {rows.slice(0, rowCount).map((row, index) => (
          <PlaylistContainer type={row.type} playlistId={row.contentId} key={`${row.contentId || row.type}_${index}`}>
            {({ playlist, error, isLoading, style }) => {
              const title = row?.title || playlist.title;
              const posterAspect = parseAspectRatio(playlist.cardImageAspectRatio || playlist.shelfImageAspectRatio);
              const visibleTilesDelta = parseTilesDelta(posterAspect);

              return (
                <div
                  style={style}
                  role="row"
                  className={classNames(styles.shelfContainer, { [styles.featured]: row.featured })}
                  data-testid={testId(`shelf-${row.featured ? 'featured' : row.type !== 'playlist' ? row.type : slugify(title)}`)}
                >
                  <div role="cell">
                    <ShelfComponent
                      loading={isLoading}
                      error={error}
                      type={row.type}
                      playlist={playlist}
                      watchHistory={row.type === PersonalShelf.ContinueWatching ? watchHistoryDictionary : undefined}
                      title={title}
                      featured={row.featured === true}
                      accessModel={accessModel}
                      isLoggedIn={!!user}
                      hasSubscription={!!subscription}
                      posterAspect={posterAspect}
                      visibleTilesDelta={visibleTilesDelta}
                    />
                  </div>
                </div>
              );
            }}
          </PlaylistContainer>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default ShelfList;
