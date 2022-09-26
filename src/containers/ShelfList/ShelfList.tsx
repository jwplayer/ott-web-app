import classNames from 'classnames';
import React, { CSSProperties, useCallback, useEffect, useRef } from 'react';
import List from 'react-virtualized/dist/commonjs/List';
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
import { useNavigate } from 'react-router-dom';
import shallow from 'zustand/shallow';
import memoize from 'memoize-one';

import styles from './ShelfList.module.scss';

import PlaylistContainer from '#src/containers/PlaylistContainer/PlaylistContainer';
import { mediaURL, slugify } from '#src/utils/formatting';
import ShelfComponent, { featuredTileBreakpoints, tileBreakpoints } from '#src/components/Shelf/Shelf';
import { PersonalShelf } from '#src/enum/PersonalShelf';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import scrollbarSize from '#src/utils/dom';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import usePlaylist from '#src/hooks/usePlaylist';
import useBlurImageUpdater from '#src/hooks/useBlurImageUpdater';
import { useAccountStore } from '#src/stores/AccountStore';
import type { Content } from '#types/Config';
import type { PlaylistItem } from '#types/playlist';

type rowData = {
  index: number;
  key: string;
  style: CSSProperties;
  itemData: ItemData;
};
type ItemData = {
  content: Content[];
};

type Props = {
  rows: Content[];
};

const createItemData = memoize((content) => ({ content }));

const ShelfList: React.VFC<Props> = ({ rows }) => {
  const navigate = useNavigate();
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const breakpoint = useBreakpoint();
  const listRef = useRef<List>() as React.MutableRefObject<List>;
  const itemData: ItemData = createItemData(rows);

  const watchHistory = useWatchHistoryStore((state) => state.getPlaylist());
  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionary());
  const favorites = useFavoritesStore((state) => state.favorites);

  const { data: { playlist } = { playlist: [] } } = usePlaylist(rows.find((el) => el.contentId)?.contentId as string);
  const updateBlurImage = useBlurImageUpdater(playlist);

  // User
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);

  const onCardClick = useCallback(
    (playlistItem, playlistId, type) => {
      navigate(mediaURL(playlistItem, playlistId, type === PersonalShelf.ContinueWatching));
    },
    [navigate],
  );
  const onCardHover = useCallback(
    (playlistItem: PlaylistItem) => {
      updateBlurImage(playlistItem);
    },
    [updateBlurImage],
  );

  const rowRenderer = ({ index, key, style, itemData }: rowData) => {
    if (!itemData?.content?.[index]) return null;

    const contentItem: Content = itemData.content[index];

    // For 'continue_watching' and 'favorites' sections there may be no contentId
    const playlistKey = contentItem.contentId || contentItem.type;

    return (
      <PlaylistContainer key={`${playlistKey}_${index}`} type={contentItem.type} playlistId={contentItem.contentId} style={style}>
        {({ playlist, error, isLoading, style }) => {
          const title = contentItem?.title || playlist.title;

          return (
            <div
              key={key}
              style={style}
              role="row"
              className={classNames(styles.shelfContainer, { [styles.featured]: contentItem.featured })}
              data-testid={`shelf-${contentItem.featured ? 'featured' : contentItem.type !== 'playlist' ? contentItem.type : slugify(title)}`}
            >
              <div role="cell">
                <ShelfComponent
                  loading={isLoading}
                  error={error}
                  type={contentItem.type}
                  playlist={playlist}
                  watchHistory={contentItem.type === PersonalShelf.ContinueWatching ? watchHistoryDictionary : undefined}
                  onCardClick={onCardClick}
                  onCardHover={onCardHover}
                  enableTitle={contentItem.enableText}
                  enableCardTitles={config.styling.shelfTitles}
                  title={title}
                  featured={contentItem.featured === true}
                  accessModel={accessModel}
                  isLoggedIn={!!user}
                  hasSubscription={!!subscription}
                />
              </div>
            </div>
          );
        }}
      </PlaylistContainer>
    );
  };

  const calculateHeight = (index: number): number => {
    const item = rows[index];
    const isDesktop = breakpoint >= Breakpoint.lg;
    const isMobile = breakpoint === Breakpoint.xs;
    const isTablet = !isDesktop && !isMobile;

    if (!item) return 0;
    if (item.type === PersonalShelf.ContinueWatching && !watchHistory.playlist.length) return 0;
    if (item.type === PersonalShelf.Favorites && !favorites.length) return 0;

    const calculateFeatured = () => {
      const tilesToShow = featuredTileBreakpoints[breakpoint];
      const shelfMetaHeight = 50;
      const shelfHorizontalMargin = isDesktop ? document.body.offsetWidth * 0.4 : isTablet ? document.body.offsetWidth * 0.2 : 0;
      const cardWidth = (document.body.offsetWidth - shelfHorizontalMargin) / tilesToShow;
      const cardHeight = cardWidth * (9 / 16);

      return cardHeight + shelfMetaHeight;
    };
    const calculateRegular = () => {
      const tilesToShow = tileBreakpoints[breakpoint];
      const shelfTitlesHeight = item.enableText ? 40 : 0;
      const shelfMetaHeight = shelfTitlesHeight + 12;
      const cardMetaHeight = config.styling.shelfTitles ? 40 : 0;
      const shelfHorizontalMargin = isMobile ? 76 : 0;
      const cardWidth = (document.body.offsetWidth - shelfHorizontalMargin) / tilesToShow;
      const cardHeight = cardWidth * (9 / 16);

      return cardHeight + shelfMetaHeight + cardMetaHeight;
    };

    return item.featured ? calculateFeatured() : calculateRegular();
  };

  useEffect(() => {
    if (favorites || watchHistory) {
      (listRef.current as unknown as List)?.recomputeRowHeights();
    }
  }, [favorites, watchHistory]);

  return (
    <div className={styles.shelfList}>
      <WindowScroller onResize={() => (listRef.current as unknown as List)?.recomputeRowHeights()}>
        {({ height, isScrolling, onChildScroll, scrollTop }) => {
          return (
            <List
              className={styles.list}
              tabIndex={-1}
              ref={listRef}
              autoHeight
              height={height}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              rowCount={rows.length}
              getScrollbarSize={scrollbarSize}
              rowHeight={({ index }) => calculateHeight(index)}
              rowRenderer={({ index, key, style }) => rowRenderer({ index, key, style, itemData })}
              scrollTop={scrollTop}
              width={document.body.offsetWidth}
              isScrollingOptOut
              overscanRowCount={3}
            />
          );
        }}
      </WindowScroller>
    </div>
  );
};

export default ShelfList;
