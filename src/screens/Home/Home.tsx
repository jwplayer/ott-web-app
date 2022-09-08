import React, { CSSProperties, useCallback, useEffect, useRef } from 'react';
import memoize from 'memoize-one';
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
import List from 'react-virtualized/dist/commonjs/List';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import shallow from 'zustand/shallow';

import styles from './Home.module.scss';

import PlaylistContainer from '#src/containers/PlaylistContainer/PlaylistContainer';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { useAccountStore } from '#src/stores/AccountStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import { PersonalShelf } from '#src/enum/PersonalShelf';
import useBlurImageUpdater from '#src/hooks/useBlurImageUpdater';
import ShelfComponent, { featuredTileBreakpoints, tileBreakpoints } from '#src/components/Shelf/Shelf';
import usePlaylist from '#src/hooks/usePlaylist';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import scrollbarSize from '#src/utils/dom';
import { cardUrl, slugify } from '#src/utils/formatting';
import type { PlaylistItem } from '#types/playlist';
import type { Content } from '#types/Config';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';

type rowData = {
  index: number;
  key: string;
  style: CSSProperties;
  itemData: ItemData;
};
type ItemData = {
  content: Content[];
};

const createItemData = memoize((content) => ({ content }));

const Home = (): JSX.Element => {
  const history = useHistory();
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const breakpoint = useBreakpoint();
  const listRef = useRef<List>() as React.MutableRefObject<List>;
  const content: Content[] = config?.content;
  const itemData: ItemData = createItemData(content);

  const watchHistory = useWatchHistoryStore((state) => state.getPlaylist());
  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionary());
  const favorites = useFavoritesStore((state) => state.favorites);

  const { data: { playlist } = { playlist: [] } } = usePlaylist(content.find((el) => el.contentId)?.contentId as string);
  const updateBlurImage = useBlurImageUpdater(playlist);

  // User
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);

  const onCardClick = useCallback(
    (playlistItem, playlistId, type) => {
      history.push(cardUrl(playlistItem, playlistId, type === PersonalShelf.ContinueWatching));
    },
    [history],
  );
  const onCardHover = useCallback((playlistItem: PlaylistItem) => updateBlurImage(playlistItem.image), [updateBlurImage]);

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
    const item = content[index];
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
    <div className={styles.home}>
      <WindowScroller onResize={() => (listRef.current as unknown as List)?.recomputeRowHeights()}>
        {({ height, isScrolling, onChildScroll, scrollTop }) => (
          <List
            className={styles.list}
            tabIndex={-1}
            ref={listRef}
            autoHeight
            height={height}
            isScrolling={isScrolling}
            onScroll={onChildScroll}
            rowCount={content.length}
            getScrollbarSize={scrollbarSize}
            rowHeight={({ index }) => calculateHeight(index)}
            rowRenderer={({ index, key, style }) => rowRenderer({ index, key, style, itemData })}
            scrollTop={scrollTop}
            width={document.body.offsetWidth}
            isScrollingOptOut
            overscanRowCount={3}
          />
        )}
      </WindowScroller>
    </div>
  );
};

export default Home;
