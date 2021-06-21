import React, { useContext, useEffect, useRef } from 'react';
import type { Config } from 'types/Config';
import type { PlaylistItem } from 'types/playlist';
import type { VideoProgress } from 'types/video';
import type { JWPlayer } from 'types/jwplayer';

import { VideoProgressMinMax } from '../../config';
import { useWatchHistoryListener } from '../../hooks/useWatchHistoryListener';
import { watchHistoryStore, useWatchHistory } from '../../stores/WatchHistoryStore';
import { ConfigContext } from '../../providers/ConfigProvider';
import { addScript } from '../../utils/dom';
import useOttAnalytics from '../../hooks/useOttAnalytics';

import styles from './Cinema.module.scss';

type Props = {
  item: PlaylistItem;
  onPlay?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onUserActive?: () => void;
  onUserInActive?: () => void;
  feedId?: string;
  isTrailer?: boolean;
  playerId?: string;
};

const Cinema: React.FC<Props> = ({ item, onPlay, onPause, onComplete, onUserActive, onUserInActive, feedId, isTrailer = false }: Props) => {
  const config: Config = useContext(ConfigContext);
  const playerElementRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<JWPlayer>();
  const scriptUrl = `https://content.jwplatform.com/libraries/${config.player}.js`;
  const enableWatchHistory = config.options.enableContinueWatching && !isTrailer;
  const setPlayer = useOttAnalytics(item, feedId);

  const getProgress = (): VideoProgress | null => {
    if (!playerRef.current) return null;

    const duration = playerRef.current.getDuration();
    const progress = playerRef.current.getPosition() / duration;

    return { duration, progress } as VideoProgress;
  };

  const { saveItem } = useWatchHistory();
  useWatchHistoryListener(() => (enableWatchHistory ? saveItem(item, getProgress) : null));

  useEffect(() => {
    if (!config.player) {
      return;
    }

    const loadPlaylist = () => {
      if (!item || !playerRef.current) {
        return;
      }

      const currentItem = playerRef.current?.getPlaylistItem() as PlaylistItem | null;

      // we already loaded this item
      if (currentItem && currentItem.mediaid === item.mediaid) {
        return;
      }

      // load new item
      playerRef.current.load([
        {
          mediaid: item.mediaid,
          image: item.image,
          title: item.title,
          description: item.description,
          sources: item.sources.map((source) => ({ ...source })),
        },
      ]);
    };

    const initializePlayer = () => {
      if (!window.jwplayer || !playerElementRef.current) return;

      const { watchHistory } = watchHistoryStore.getRawState();
      const watchHistoryItem = watchHistory.find(({ mediaid }) => mediaid === item.mediaid);
      let applyWatchHistory = !!watchHistory && enableWatchHistory;

      playerRef.current = window.jwplayer(playerElementRef.current);

      playerRef.current.setup({
        playlist: [
          {
            mediaid: item.mediaid,
            image: item.image,
            title: item.title,
            description: item.description,
            sources: item.sources.map((source) => ({ ...source })),
          },
        ],
        aspect: false,
        width: '100%',
        height: '100%',
        mute: false,
        autostart: true,
      });

      setPlayer(playerRef.current);

      const handlePlay = () => onPlay && onPlay();
      const handlePause = () => onPause && onPause();
      const handleComplete = () => onComplete && onComplete();
      const handleUserActive = () => onUserActive && onUserActive();
      const handleUserInactive = () => onUserInActive && onUserInActive();

      const handleBeforePlay = () => {
        if (!applyWatchHistory) {
          return;
        }

        applyWatchHistory = false; // Only the first time beforePlay
        const { progress, duration } = watchHistoryItem || {};

        if (playerRef.current && progress && duration && progress > VideoProgressMinMax.Min && progress < VideoProgressMinMax.Max) {
          playerRef.current.seek(duration * progress);
        }
      };

      playerRef.current.on('play', handlePlay);
      playerRef.current.on('pause', handlePause);
      playerRef.current.on('complete', handleComplete);

      playerRef.current.on('beforePlay', handleBeforePlay);

      playerRef.current.on('userActive', handleUserActive);
      playerRef.current.on('userInactive', handleUserInactive);
    };

    if (playerRef.current) {
      return loadPlaylist();
    }

    window.jwplayer ? initializePlayer() : addScript(scriptUrl, initializePlayer);
  }, [item, onPlay, onPause, onUserActive, onUserInActive, onComplete, config.player, scriptUrl, enableWatchHistory, setPlayer]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.remove();
      }
    };
  }, []);

  return (
    <div className={styles.cinema}>
      <div ref={playerElementRef} />
    </div>
  );
};

export default Cinema;
