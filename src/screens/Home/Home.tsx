import React, { CSSProperties, useContext, useEffect, useRef } from 'react';
import memoize from 'memoize-one';
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
import List from 'react-virtualized/dist/commonjs/List';
import { useHistory } from 'react-router-dom';
import type { Config, Content } from 'types/Config';
import type { PlaylistItem } from 'types/playlist';

import { UIStateContext, UpdateBlurImage } from '../../providers/uiStateProvider';
import Layout from '../../components/Layout/Layout';
import Shelf from '../../container/Shelf/Shelf';
import { ConfigContext } from '../../providers/configProvider';
import type { UsePlaylistResult } from '../../hooks/usePlaylist';
import usePlaylist from '../../hooks/usePlaylist';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import scrollbarSize from '../../utils/dom';

import styles from './Home.module.scss';

type rowData = {
  index: number;
  key: string;
  style: CSSProperties;
  itemData: ItemData;
};
type ItemData = {
  content: Content[];
  onCardClick: (playlistItem: PlaylistItem) => void;
  updateBlurImage: UpdateBlurImage;
};

const tileBreakpoints = {
  [Breakpoint.xs]: 1,
  [Breakpoint.sm]: 3,
  [Breakpoint.md]: 4,
  [Breakpoint.lg]: 5,
  [Breakpoint.xl]: 6,
};

const renderRow = ({ index, key, style, itemData }: rowData) => {
  const { content, onCardClick, updateBlurImage } = itemData;
  const contentItem: Content = content[index];
  if (!contentItem) return null;

  return (
    <div key={key} style={style}>
      <Shelf
        key={contentItem.playlistId}
        playlistId={contentItem.playlistId}
        onCardClick={onCardClick}
        onCardHover={(playlistItem: PlaylistItem) => updateBlurImage(playlistItem.image)}
        featured={contentItem.featured === true}
      />
    </div>
  );
};

const createItemData = memoize((content, onCardClick, updateBlurImage) => ({
  content,
  onCardClick,
  updateBlurImage,
}));

const Home = (): JSX.Element => {
  const history = useHistory();
  const config: Config = useContext(ConfigContext);
  const { updateBlurImage } = useContext(UIStateContext);
  const breakpoint = useBreakpoint();
  const listRef = useRef<List>() as React.MutableRefObject<List>;
  const content: Content[] = config ? config.content : [];

  const usePlaylistArg: string | undefined = content.length ? content[0]?.playlistId : undefined;
  const { data: firstPlaylist }: UsePlaylistResult = usePlaylist(usePlaylistArg || '');

  const onCardClick = (playlistItem: PlaylistItem) => playlistItem && history.push(`/play/${playlistItem.mediaid}`);

  const itemData: ItemData = createItemData(content, onCardClick, updateBlurImage);

  const calculateHeight = (index: number): number => {
    const item = content[index];
    if (!item) return 0;
    const tilesToShow: number = item.featured ? 1 : tileBreakpoints[breakpoint];
    const shelfMetaHeight = item.featured ? 0 : 28 + 20 + 20;
    const cardMetaHeight = item.featured ? 0 : 20 + 8;
    const shelfHorizontalMargin = 50;
    const cardHorizontalMargin = 10;
    const shelfPadding = 20;
    const cardWidth = (document.body.offsetWidth - shelfHorizontalMargin) / tilesToShow - cardHorizontalMargin;
    const cardHeight = (cardWidth / 16) * 9 + cardMetaHeight;
    return cardHeight + shelfMetaHeight + shelfPadding;
  };

  useEffect(() => {
    if (firstPlaylist?.playlist[0]?.image) updateBlurImage(firstPlaylist.playlist[0].image);
  }, [firstPlaylist, updateBlurImage]);

  return (
    <Layout>
      <div className={styles['Home']}>
        {/* <InfiniteLoader isRowLoaded={(index) => !!content[index]} loadMoreRows={loadMoreRows} rowCount={5}>
          {({ onRowsRendered, registerChild }) => ( */}
        <WindowScroller onResize={() => ((listRef.current as unknown) as List)?.recomputeRowHeights()}>
          {({ height, isScrolling, onChildScroll, scrollTop }) => (
            <List
              ref={listRef}
              autoHeight
              height={height}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              rowCount={content.length}
              getScrollbarSize={scrollbarSize}
              // onRowsRendered={onRowsRendered}
              // ref={registerChild}
              rowHeight={({ index }) => calculateHeight(index)}
              rowRenderer={({ index, key, style }) => renderRow({ index, key, style, itemData })}
              scrollTop={scrollTop}
              width={document.body.offsetWidth}
            />
          )}
        </WindowScroller>
        {/* )}
        </InfiniteLoader> */}
      </div>
    </Layout>
  );
};

export default Home;
