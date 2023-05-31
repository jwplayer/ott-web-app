import React from 'react';
import classNames from 'classnames';

import styles from './VideoList.module.scss';

import VideoListItem from '#components/VideoListItem/VideoListItem';
import { isLocked } from '#src/utils/entitlements';
import { testId } from '#src/utils/common';
import type { AccessModel } from '#types/Config';
import type { Playlist, PlaylistItem } from '#types/playlist';
import { isLiveChannel } from '#src/utils/media';
import { MediaStatus } from '#src/utils/liveEvent';

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
}: Props) {
  return (
    <div className={classNames(styles.container, !!className && className)} data-testid={testId('video-list')}>
      {!!header && header}
      {playlist &&
        playlist.playlist.map((playlistItem: PlaylistItem) => {
          const { mediaid, title, duration, seriesId, episodeNumber, seasonNumber, shelfImage, mediaStatus } = playlistItem;

          return (
            <VideoListItem
              key={mediaid}
              title={title}
              scheduledStart={playlistItem.scheduledStart}
              duration={duration}
              image={shelfImage}
              progress={watchHistory ? watchHistory[mediaid] : undefined}
              seriesId={seriesId}
              episodeNumber={episodeNumber}
              seasonNumber={seasonNumber}
              onClick={() => onListItemClick && onListItemClick(playlistItem, playlistItem.feedid)}
              onHover={() => onListItemHover && onListItemHover(playlistItem)}
              loading={isLoading}
              isActive={activeMediaId === mediaid}
              activeLabel={activeLabel}
              isLocked={isLocked(accessModel, isLoggedIn, hasSubscription, playlistItem)}
              isLive={mediaStatus === MediaStatus.LIVE || isLiveChannel(playlistItem)}
              isScheduled={mediaStatus === MediaStatus.SCHEDULED}
            />
          );
        })}
    </div>
  );
}

export default VideoList;
