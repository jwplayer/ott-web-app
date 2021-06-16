import React, { CSSProperties, useContext, useRef } from 'react';
import memoize from 'memoize-one';
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
import List from 'react-virtualized/dist/commonjs/List';
import { useHistory } from 'react-router-dom';
import type { Config, Content } from 'types/Config';
import type { PlaylistItem } from 'types/playlist';
import classNames from 'classnames';

import { favoritesStore } from '../../stores/FavoritesStore';
import { PersonalShelf } from '../../enum/PersonalShelf';
import { watchHistoryStore } from '../../stores/WatchHistoryStore';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { featuredTileBreakpoints, tileBreakpoints } from '../../components/Shelf/Shelf';
import Shelf from '../../containers/Shelf/Shelf';
import { ConfigContext } from '../../providers/ConfigProvider';
import usePlaylist from '../../hooks/usePlaylist';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import scrollbarSize from '../../utils/dom';
import { cardUrl } from '../../utils/formatting';

import styles from './Home.module.scss';

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
  const config: Config = useContext(ConfigContext);
  const breakpoint = useBreakpoint();
  const listRef = useRef<List>() as React.MutableRefObject<List>;
  const content: Content[] = config?.content;
  const watchHistory = watchHistoryStore.useState();
  const favorites = favoritesStore.useState();

  const { data: { playlist } = { playlist: [] } } = usePlaylist(content[0]?.playlistId);
  const updateBlurImage = useBlurImageUpdater(playlist);

  const itemData: ItemData = createItemData(content);

  const rowRenderer = ({ index, key, style, itemData }: rowData) => {
    if (!itemData?.content?.[index]) return null;

    const contentItem: Content = itemData.content[index];

    const onCardClick = (playlistItem: PlaylistItem) => history.push(cardUrl(playlistItem, contentItem.playlistId));
    const onCardHover = (playlistItem: PlaylistItem) => updateBlurImage(playlistItem.image);

    return (
      <div
        key={key}
        style={style}
        className={classNames(styles.shelfContainer, { [styles.featured]: contentItem.featured })}
      >
        <Shelf
          key={contentItem.playlistId}
          playlistId={contentItem.playlistId}
          onCardClick={onCardClick}
          onCardHover={onCardHover}
          featured={contentItem.featured === true}
        />
      </div>
    );
  };

  const calculateHeight = (index: number): number => {
    const item = content[index];
    const isLargeScreen = breakpoint >= Breakpoint.md;

    if (!item) return 0;
    if (item.playlistId === PersonalShelf.ContinueWatching && !watchHistory.watchHistory.length) return 0;
    if (item.playlistId === PersonalShelf.Favorites && !favorites.favorites.length) return 0;

    const calculateFeatured = () => {
      const tilesToShow = featuredTileBreakpoints[breakpoint];
      const shelfMetaHeight = 24;
      const cardMetaHeight = 10;
      const shelfHorizontalMargin = isLargeScreen ? document.body.offsetWidth * 0.4 : 0;
      const cardWidth = (document.body.offsetWidth - shelfHorizontalMargin) / tilesToShow;
      const cardHeight = cardWidth * (9 / 16);

      return cardHeight + shelfMetaHeight + cardMetaHeight;
    };
    const calculateRegular = () => {
      const tilesToShow = tileBreakpoints[breakpoint];
      const shelfTitlesHeight = config.options.shelveTitles ? 40 : 0;
      const shelfMetaHeight = shelfTitlesHeight + 24;
      const cardMetaHeight = 40;
      const shelfHorizontalMargin = 0 * featuredTileBreakpoints[breakpoint];
      const cardWidth = (document.body.offsetWidth - shelfHorizontalMargin) / tilesToShow;
      const cardHeight = cardWidth * (9 / 16);

      return cardHeight + shelfMetaHeight + cardMetaHeight;
    };

    return item.featured ? calculateFeatured() : calculateRegular();
  };

  return (
    <div className={styles.home}>
      <WindowScroller onResize={() => ((listRef.current as unknown) as List)?.recomputeRowHeights()}>
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
