import React, { CSSProperties, useCallback, useEffect, useRef } from 'react';
import memoize from 'memoize-one';
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
import List from 'react-virtualized/dist/commonjs/List';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import shallow from 'zustand/shallow';

import PlaylistContainer from '../../containers/Playlist/PlaylistContainer';
import { favoritesStore } from '../../stores/FavoritesStore';
import { useAccountStore } from '../../stores/AccountStore';
import { useConfigStore } from '../../stores/ConfigStore';
import { PersonalShelf } from '../../enum/PersonalShelf';
import { useWatchHistory } from '../../stores/WatchHistoryStore';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import ShelfComponent, { featuredTileBreakpoints, tileBreakpoints } from '../../components/Shelf/Shelf';
import usePlaylist from '../../hooks/usePlaylist';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import scrollbarSize from '../../utils/dom';
import { cardUrl } from '../../utils/formatting';

import styles from './Home.module.scss';

import type { PlaylistItem } from '#types/playlist';
import type { Content } from '#types/Config';

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
  const config = useConfigStore((state) => state.config);
  const accessModel = useConfigStore((state) => state.accessModel);
  const breakpoint = useBreakpoint();
  const listRef = useRef<List>() as React.MutableRefObject<List>;
  const content: Content[] = config?.content;
  const itemData: ItemData = createItemData(content);

  const { getPlaylist: getWatchHistoryPlaylist, getDictionary: getWatchHistoryDictionary } = useWatchHistory();
  const watchHistory = getWatchHistoryPlaylist();
  const watchHistoryDictionary = getWatchHistoryDictionary();
  const favorites = favoritesStore.useState((state) => state.favorites);

  const { data: { playlist } = { playlist: [] } } = usePlaylist(content[0]?.playlistId);
  const updateBlurImage = useBlurImageUpdater(playlist);

  // User
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);

  const onCardClick = useCallback(
    (playlistItem: PlaylistItem, playlistId?: string) => {
      history.push(cardUrl(playlistItem, playlistId, playlistId === PersonalShelf.ContinueWatching));
    },
    [history],
  );
  const onCardHover = useCallback((playlistItem: PlaylistItem) => updateBlurImage(playlistItem.image), [updateBlurImage]);

  const rowRenderer = ({ index, key, style, itemData }: rowData) => {
    if (!itemData?.content?.[index]) return null;

    const contentItem: Content = itemData.content[index];

    return (
      <PlaylistContainer key={contentItem.playlistId} playlistId={contentItem.playlistId} style={style}>
        {({ playlist, error, isLoading, style }) => (
          <div key={key} style={style} role="row" className={classNames(styles.shelfContainer, { [styles.featured]: contentItem.featured })}>
            <div role="cell">
              <ShelfComponent
                loading={isLoading}
                error={error}
                playlist={playlist}
                watchHistory={playlist.feedid === PersonalShelf.ContinueWatching ? watchHistoryDictionary : undefined}
                onCardClick={onCardClick}
                onCardHover={onCardHover}
                enableTitle={contentItem.enableText}
                enableCardTitles={config.options.shelfTitles}
                title={playlist.title}
                featured={contentItem.featured === true}
                accessModel={accessModel}
                isLoggedIn={!!user}
                hasSubscription={!!subscription}
              />
            </div>
          </div>
        )}
      </PlaylistContainer>
    );
  };

  const calculateHeight = (index: number): number => {
    const item = content[index];
    const isDesktop = breakpoint >= Breakpoint.lg;
    const isMobile = breakpoint === Breakpoint.xs;
    const isTablet = !isDesktop && !isMobile;

    if (!item) return 0;
    if (item.playlistId === PersonalShelf.ContinueWatching && !watchHistory.playlist.length) return 0;
    if (item.playlistId === PersonalShelf.Favorites && !favorites.length) return 0;

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
      const cardMetaHeight = config.options.shelfTitles ? 40 : 0;
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
