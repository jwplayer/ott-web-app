import React from 'react';
import classNames from 'classnames';
import InfiniteScroll from 'react-infinite-scroller';

import styles from './VideoList.module.scss';

import VideoListItem from '#components/VideoListItem/VideoListItem';
import { isLocked } from '#src/utils/entitlements';
import { testId } from '#src/utils/common';
import type { AccessModel } from '#types/Config';
import type { Playlist, PlaylistItem } from '#types/playlist';
import InfiniteScrollLoader from '#components/InfiniteScrollLoader/InfiniteScrollLoader';

type Props = {
  playlist?: Playlist;
  header?: React.ReactNode;
  onListItemHover?: (item: PlaylistItem) => void;
  watchHistory?: { [key: string]: number };
  isLoading: boolean;
  activeMediaId?: string;
  activeLabel?: string;
  className?: string;
  accessModel: AccessModel;
  isLoggedIn: boolean;
  hasSubscription: boolean;
  hasLoadMore?: boolean;
  loadMore?: () => void;
  getUrl: (item: PlaylistItem) => string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const defaultLoadMore = () => {};

function VideoList({
  playlist,
  header,
  onListItemHover,
  isLoading = false,
  watchHistory,
  activeMediaId,
  activeLabel,
  className,
  accessModel,
  isLoggedIn,
  hasSubscription,
  hasLoadMore,
  loadMore = defaultLoadMore,
  getUrl,
}: Props) {
  return (
    <div className={classNames(styles.container, !!className && className)} data-testid={testId('video-list')}>
      {!!header && header}
      <div className={styles.content}>
        <InfiniteScroll pageStart={0} loadMore={loadMore || defaultLoadMore} hasMore={hasLoadMore} loader={<InfiniteScrollLoader key="loader" />}>
          {playlist?.playlist?.map((playlistItem: PlaylistItem) => (
            <VideoListItem
              url={getUrl(playlistItem)}
              key={playlistItem.mediaid}
              progress={watchHistory ? watchHistory[playlistItem.mediaid] : undefined}
              onHover={() => onListItemHover && onListItemHover(playlistItem)}
              loading={isLoading}
              isActive={activeMediaId === playlistItem.mediaid}
              activeLabel={activeLabel}
              isLocked={isLocked(accessModel, isLoggedIn, hasSubscription, playlistItem)}
              item={playlistItem}
            />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default VideoList;
