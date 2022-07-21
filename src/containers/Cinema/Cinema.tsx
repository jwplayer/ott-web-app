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
  videoMeta: string;
  isSeries: boolean;
  seriesMeta?: string;
  episodeTitle?: string;
};

const Cinema: React.FC<Props> = ({ open, item, title, videoMeta, isSeries, seriesMeta, episodeTitle, onPlay, onPause, onComplete, onClose, feedId }: Props) => {
  const { t } = useTranslation();
  const { player, features } = useConfigStore((s) => s.config);
  const continueWatchingList = features?.continueWatchingList;
  const enableWatchHistory = !!continueWatchingList;

  // state
  const [playerInstance, setPlayerInstance] = useState<JWPlayer>();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userActive, setUserActive] = useState(true);

  // watch history
  const watchHistoryItem = useWatchHistoryStore((state) => item && state.getItem(item));
  const videoProgress = watchHistoryItem?.progress;

  const startTime = useMemo(() => {
    if (videoProgress && videoProgress > VideoProgressMinMax.Min && videoProgress < VideoProgressMinMax.Max) {
      return videoProgress * item.duration;
    }

    return 0;
  }, [item, videoProgress]);

  const getProgress = useCallback((): number | null => {
    if (!playerInstance) return null;

    return playerInstance.getPosition() / item.duration;
  }, [playerInstance, item.duration]);

  useWatchHistoryListener(() => (enableWatchHistory ? saveItem(item, getProgress()) : null));

  // player events
  const handleReady = useCallback((player?: JWPlayer) => {
    setPlayerInstance(player);
  }, []);

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
  const handlePlaylistItemCallback = usePlaylistItemCallback();

  // effects
  useEffect(() => {
    if (open) setUserActive(true);
    if (!open) saveItem(item, getProgress());
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
                  {isSeries && (
                    <div className={styles.seriesMeta}>
                      <strong>{seriesMeta}</strong> - {episodeTitle}
                    </div>
                  )}
                  <div className={styles.meta}>{videoMeta}</div>
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
