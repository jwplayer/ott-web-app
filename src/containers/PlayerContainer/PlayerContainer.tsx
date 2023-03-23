import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { useWatchHistoryListener } from '#src/hooks/useWatchHistoryListener';
import type { PlaylistItem } from '#types/playlist';
import { saveItem } from '#src/stores/WatchHistoryController';
import { usePlaylistItemCallback } from '#src/hooks/usePlaylistItemCallback';
import { useConfigStore } from '#src/stores/ConfigStore';
import Player from '#components/Player/Player';
import type { JWPlayer } from '#types/jwplayer';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { VideoProgressMinMax } from '#src/config';
import useContentProtection from '#src/hooks/useContentProtection';
import { getMediaById } from '#src/services/api.service';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import useEventCallback from '#src/hooks/useEventCallback';
import { logDev } from '#src/utils/common';
import { useSettingsStore } from '#src/stores/SettingsStore';

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
  const { data: playableItem, isLoading } = useContentProtection('media', item.mediaid, (token, drmPolicyId) => getMediaById(item.mediaid, token, drmPolicyId));

  // state
  const [playerInstance, setPlayerInstance] = useState<JWPlayer>();

  // watch history
  const watchHistoryItem = useWatchHistoryStore((state) => (!!item && watchHistoryEnabled ? state.getItem(item) : undefined));

  const { playerId, playerKey } = useSettingsStore((s) => s);

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

    // this call may fail when the player is being removed due to a race condition
    try {
      return playerInstance.getPosition() / item.duration;
    } catch (error: unknown) {
      logDev('Error caught while calling `getPosition`');
      return null;
    }
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

  const handleWatchHistory = useEventCallback(() => {
    if (watchHistoryEnabled) {
      saveItem(item, getProgress());
    }
  });

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
    setPlayerInstance(undefined);
  }, [handleWatchHistory]);

  const handlePlaylistItemCallback = usePlaylistItemCallback(liveStartDateTime, liveEndDateTime);

  // Effects

  // use layout effect to prevent a JWPlayer error when the instance has been removed while loading the entitlement
  useLayoutEffect(() => {
    // save watch history when the item changes
    return () => handleWatchHistory();
  }, [handleWatchHistory, item]);

  if (!playableItem || isLoading) {
    return <LoadingOverlay inline />;
  }

  return (
    <Player
      playerId={playerId}
      playerKey={playerKey}
      feedId={feedId}
      item={playableItem}
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
