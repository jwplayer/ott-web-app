import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Cinema.module.scss';

import { useWatchHistoryListener } from '#src/hooks/useWatchHistoryListener';
import type { PlaylistItem } from '#types/playlist';
import { saveItem } from '#src/stores/WatchHistoryController';
import { usePlaylistItemCallback } from '#src/hooks/usePlaylistItemCallback';
import { useConfigStore } from '#src/stores/ConfigStore';
import Fade from '#src/components/Animation/Fade/Fade';
import IconButton from '#src/components/IconButton/IconButton';
import ArrowLeft from '#src/icons/ArrowLeft';
import Player from '#src/components/Player/Player';
import type { JWPlayer } from '#types/jwplayer';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { VideoProgressMinMax } from '#src/config';

type Props = {
  open: boolean;
  item: PlaylistItem;
  onPlay?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onClose?: () => void;
  feedId?: string;
  title: string;
  primaryMetadata: React.ReactNode;
  secondaryMetadata?: React.ReactNode;
  liveStartDateTime?: string | null;
  liveEndDateTime?: string | null;
  liveFromBeginning?: boolean;
};

const Cinema: React.FC<Props> = ({
  open,
  item,
  title,
  primaryMetadata,
  secondaryMetadata,
  onPlay,
  onPause,
  onComplete,
  onClose,
  feedId,
  liveStartDateTime,
  liveEndDateTime,
  liveFromBeginning,
}: Props) => {
  const { t } = useTranslation();
  const { player, features } = useConfigStore((s) => s.config);
  const continueWatchingList = features?.continueWatchingList;
  const enableWatchHistory = !!continueWatchingList;

  // state
  const [playerInstance, setPlayerInstance] = useState<JWPlayer>();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userActive, setUserActive] = useState(true);

  // watch history
  const watchHistoryItem = useWatchHistoryStore((state) => (!!item && enableWatchHistory ? state.getItem(item) : undefined));

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

  useWatchHistoryListener(() => (enableWatchHistory ? saveItem(item, getProgress()) : null));

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

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay && onPlay();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    enableWatchHistory && saveItem(item, getProgress());
    onPause && onPause();
  }, [enableWatchHistory, getProgress, item, onPause]);

  const handleComplete = useCallback(() => {
    enableWatchHistory && saveItem(item, getProgress());
    onComplete && onComplete();
  }, [enableWatchHistory, getProgress, item, onComplete]);

  const handleUserActive = useCallback(() => setUserActive(true), []);
  const handleUserInactive = useCallback(() => setUserActive(false), []);
  const handlePlaylistItemCallback = usePlaylistItemCallback(liveStartDateTime, liveEndDateTime);

  // effects
  useEffect(() => {
    if (open) {
      setUserActive(true);
      document.body.style.overflowY = 'hidden';
    } else {
      enableWatchHistory && saveItem(item, getProgress());
    }

    return () => {
      document.body.style.overflowY = '';
    };
    // This is needed since we only want this effect to run when the `open` property updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Fade open={open}>
      <div className={styles.playerContainer}>
        <div className={styles.player}>
          <Player
            playerId={player}
            feedId={feedId}
            item={item}
            onReady={handleReady}
            onFirstFrame={handleFirstFrame}
            onPlay={handlePlay}
            onPause={handlePause}
            onComplete={handleComplete}
            onUserActive={handleUserActive}
            onUserInActive={handleUserInactive}
            onPlaylistItemCallback={handlePlaylistItemCallback}
            startTime={startTime}
          />
        </div>
        <Fade open={!isPlaying || userActive}>
          <div className={styles.playerOverlay}>
            <div className={styles.playerContent}>
              <IconButton aria-label={t('common:back')} onClick={onClose} className={styles.backButton}>
                <ArrowLeft />
              </IconButton>
              <div>
                <h2 className={styles.title}>{title}</h2>
                <div className={styles.metaContainer}>
                  {secondaryMetadata && <div className={styles.secondaryMetadata}>{secondaryMetadata}</div>}
                  <div className={styles.primaryMetadata}>{primaryMetadata}</div>
                </div>
              </div>
            </div>
          </div>
        </Fade>
      </div>
    </Fade>
  );
};

export default Cinema;
