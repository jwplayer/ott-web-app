import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useWatchHistoryListener } from '#src/hooks/useWatchHistoryListener';
import type { PlaylistItem } from '#types/playlist';
import { saveItem } from '#src/stores/WatchHistoryController';
import { usePlaylistItemCallback } from '#src/hooks/usePlaylistItemCallback';
import { useConfigStore } from '#src/stores/ConfigStore';
import Player from '#components/Player/Player';
import type { JWPlayer } from '#types/jwplayer';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { DEFAULT_PLAYER_ID, VideoProgressMinMax } from '#src/config';

type Props = {
  item: PlaylistItem;
  onPlay?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onClose?: () => void;
  onUserActive?: () => void;
  onUserInActive?: () => void;
  onNext?: () => void;
  feedId?: string;
  liveStartDateTime?: string | null;
  liveEndDateTime?: string | null;
  liveFromBeginning?: boolean;
  autostart?: boolean;
};

const PlayerContainer: React.FC<Props> = ({
  item,
  feedId,
  onPlay,
  onPause,
  onComplete,
  onUserActive,
  onUserInActive,
  onNext,
  liveEndDateTime,
  liveFromBeginning,
  liveStartDateTime,
  autostart,
}: Props) => {
  const { features } = useConfigStore((s) => s.config);
  const continueWatchingList = features?.continueWatchingList;
  const watchHistoryEnabled = !!continueWatchingList;

  // state
  const [playerInstance, setPlayerInstance] = useState<JWPlayer>();

  // watch history
  const watchHistoryItem = useWatchHistoryStore((state) => (!!item && watchHistoryEnabled ? state.getItem(item) : undefined));

  const startTime = useMemo(() => {
    const videoProgress = watchHistoryItem?.progress;

    if (videoProgress && videoProgress > VideoProgressMinMax.Min && videoProgress < VideoProgressMinMax.Max) {
      return videoProgress * item.duration;
    }

    // start at the beginning of the video (only for VOD content)
    return 0;
  }, [item.duration, watchHistoryItem?.progress]);

  const getProgress = useCallback((): number | null => {
    if (!playerInstance) {
      return null;
    }

    return playerInstance.getPosition() / item.duration;
  }, [playerInstance, item.duration]);

  useWatchHistoryListener(() => (watchHistoryEnabled ? saveItem(item, getProgress()) : null));

  // player events
  const handleReady = useCallback((player?: JWPlayer) => {
    setPlayerInstance(player);
  }, []);

  const handleFirstFrame = useCallback(() => {
    // when playing a livestream, the first moment we can seek to the beginning of the DVR range is after the
    // firstFrame event.
    // @todo this doesn't seem to work 100% out of the times. Confirm with player team if this is the best approach.
    if (liveFromBeginning) {
      playerInstance?.seek(0);
    }
  }, [liveFromBeginning, playerInstance]);

  const handleWatchHistory = useCallback(() => {
    if (watchHistoryEnabled) {
      saveItem(item, getProgress());
    }
  }, [watchHistoryEnabled, getProgress, item]);

  const handlePause = useCallback(() => {
    handleWatchHistory();
    onPause && onPause();
  }, [handleWatchHistory, onPause]);

  const handleComplete = useCallback(() => {
    handleWatchHistory();
    onComplete && onComplete();
  }, [handleWatchHistory, onComplete]);

  const handleRemove = useCallback(() => {
    handleWatchHistory();
  }, [handleWatchHistory]);

  const handlePlaylistItemCallback = usePlaylistItemCallback(liveStartDateTime, liveEndDateTime);

  // Effects
  useEffect(() => {
    // save watch history when the item changes
    return () => handleWatchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  return (
    <Player
      playerId={DEFAULT_PLAYER_ID}
      feedId={feedId}
      item={item}
      onReady={handleReady}
      onFirstFrame={handleFirstFrame}
      onPlay={onPlay}
      onPause={handlePause}
      onComplete={handleComplete}
      onRemove={handleRemove}
      onUserActive={onUserActive}
      onUserInActive={onUserInActive}
      onNext={onNext}
      onPlaylistItemCallback={handlePlaylistItemCallback}
      startTime={startTime}
      autostart={autostart}
    />
  );
};

export default PlayerContainer;
