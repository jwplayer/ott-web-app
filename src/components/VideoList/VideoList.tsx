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
  onListItemClick?: (item: PlaylistItem, playlistId?: string) => void;
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
};

function VideoList({
  playlist,
  header,
  onListItemClick,
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
  loadMore,
}: Props) {
  const List = () => {
    return (
      <>
        {playlist?.playlist?.map((playlistItem: PlaylistItem) => {
          const { mediaid } = playlistItem;

          return (
            <VideoListItem
              key={mediaid}
              progress={watchHistory ? watchHistory[mediaid] : undefined}
              onClick={() => onListItemClick && onListItemClick(playlistItem, playlistItem.feedid)}
              onHover={() => onListItemHover && onListItemHover(playlistItem)}
              loading={isLoading}
              isActive={activeMediaId === mediaid}
              activeLabel={activeLabel}
              isLocked={isLocked(accessModel, isLoggedIn, hasSubscription, playlistItem)}
              item={playlistItem}
            />
          );
        })}
      </>
    );
  };

  return (
    <div className={classNames(styles.container, !!className && className)} data-testid={testId('video-list')}>
      {!!header && header}
      {loadMore ? (
        <InfiniteScroll pageStart={0} loadMore={loadMore} hasMore={hasLoadMore} loader={<InfiniteScrollLoader key="loader" />}>
          <List />
        </InfiniteScroll>
      ) : (
        <List />
      )}
    </div>
  );
}

export default VideoList;
