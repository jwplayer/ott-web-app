import React, { useState } from 'react';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useWatchHistory } from '@jwp/ott-hooks-react/src/useWatchHistory';
import { usePlaylistItemCallback } from '@jwp/ott-hooks-react/src/usePlaylistItemCallback';
import { useAds } from '@jwp/ott-hooks-react/src/useAds';
import useProtectedMedia from '@jwp/ott-hooks-react/src/useProtectedMedia';

import type { JWPlayer } from '../../../types/jwplayer';
import Player from '../../components/Player/Player';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import PlayerError, { PlayerErrorState } from '../../components/PlayerError/PlayerError';

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
  onBackClick?: () => void;
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
  onBackClick,
  liveEndDateTime,
  liveFromBeginning,
  liveStartDateTime,
  autostart,
}: Props) => {
  // data
  const { data: adsData, isLoading: isAdsLoading } = useAds({ mediaId: item?.mediaid });
  const { data: playableItem, isLoading, error } = useProtectedMedia(item);

  // state
  const [playerInstance, setPlayerInstance] = useState<JWPlayer>();

  const watchHistory = useWatchHistory(item, seriesItem);

  // player events
  const handleReady = (player?: JWPlayer) => {
    setPlayerInstance(player);
  };

  const handleFirstFrame = () => {
    // when playing a livestream, the first moment we can seek to the beginning of the DVR range is after the
    // firstFrame event.
    // @todo this doesn't seem to work 100% out of the times. Confirm with player team if this is the best approach.
    if (liveFromBeginning) {
      playerInstance?.seek(0);
    }
  };

  const handleTimeEvent = (params: { position: number; duration: number }) => {
    watchHistory.handleTimeUpdate(params);
  };

  const handlePlay = () => {
    watchHistory.saveWatchProgress();
    onPlay?.();
  };

  const handlePause = () => {
    watchHistory.saveWatchProgress();
    onPause?.();
  };

  const handleComplete = () => {
    onComplete?.();
  };

  const handleRemove = () => {
    watchHistory.saveWatchProgress();
  };

  const handlePlaylistItemCallback = usePlaylistItemCallback(liveStartDateTime, liveEndDateTime);

  if (isLoading || isAdsLoading) {
    return <LoadingOverlay inline />;
  }

  if (!playableItem || error instanceof Error) {
    let playerError = PlayerErrorState.UNKNOWN;

    if (error instanceof Error) {
      if (error.message.toLowerCase() === 'access blocked') playerError = PlayerErrorState.GEO_BLOCKED;
      if (error.message.toLowerCase() === 'unauthorized') playerError = PlayerErrorState.UNAUTHORIZED;
    }

    return <PlayerError error={playerError} />;
  }

  return (
    <Player
      feedId={feedId}
      item={playableItem}
      adsData={adsData}
      onReady={handleReady}
      onFirstFrame={handleFirstFrame}
      onPlay={handlePlay}
      onPause={handlePause}
      onTime={handleTimeEvent}
      onComplete={handleComplete}
      onUserActive={onUserActive}
      onUserInActive={onUserInActive}
      onRemove={handleRemove}
      onNext={onNext}
      onBackClick={onBackClick}
      onPlaylistItemCallback={handlePlaylistItemCallback}
      startTime={watchHistory.startTime}
      autostart={autostart}
    />
  );
};

export default PlayerContainer;
