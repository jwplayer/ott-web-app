import React, { useCallback, useState } from 'react';

import { useWatchHistory } from '#src/hooks/useWatchHistory';
import type { PlaylistItem } from '#types/playlist';
import { usePlaylistItemCallback } from '#src/hooks/usePlaylistItemCallback';
import Player from '#components/Player/Player';
import type { JWPlayer } from '#types/jwplayer';
import useContentProtection from '#src/hooks/useContentProtection';
import { getMediaById } from '#src/services/api.service';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import { useSettingsStore } from '#src/stores/SettingsStore';

type Props = {
  item: PlaylistItem;
  seriesItem?: PlaylistItem;
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
  seriesItem,
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
  // data
  const { data: playableItem, isLoading } = useContentProtection('media', item.mediaid, (token, drmPolicyId) => getMediaById(item.mediaid, token, drmPolicyId));
  const { playerId, playerLicenseKey } = useSettingsStore((s) => s);

  // state
  const [playerInstance, setPlayerInstance] = useState<JWPlayer>();

  // watch history
  const startTime = useWatchHistory(playerInstance, item, seriesItem);

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

  const handlePlaylistItemCallback = usePlaylistItemCallback(liveStartDateTime, liveEndDateTime);

  if (!playableItem || isLoading) {
    return <LoadingOverlay inline />;
  }

  return (
    <Player
      playerId={playerId}
      playerLicenseKey={playerLicenseKey}
      feedId={feedId}
      item={playableItem}
      onReady={handleReady}
      onFirstFrame={handleFirstFrame}
      onPlay={onPlay}
      onPause={onPause}
      onComplete={onComplete}
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
