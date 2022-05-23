import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import styles from './Cinema.module.scss';

import { VideoProgressMinMax } from '#src/config';
import { useWatchHistoryListener } from '#src/hooks/useWatchHistoryListener';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { ConfigContext } from '#src/providers/ConfigProvider';
import { addScript } from '#src/utils/dom';
import useOttAnalytics from '#src/hooks/useOttAnalytics';
import { deepCopy } from '#src/utils/collection';
import type { JWPlayer } from '#types/jwplayer';
import type { PlaylistItem } from '#types/playlist';
import type { Config } from '#types/Config';
import { saveItem } from '#src/stores/WatchHistoryController';
import type { VideoProgress } from '#types/video';
import useEventCallback from '#src/hooks/useEventCallback';
import { usePlaylistItemCallback } from '#src/hooks/usePlaylistItemCallback';

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
  const loadingRef = useRef(false);
  const seekToRef = useRef(-1);
  const [libLoaded, setLibLoaded] = useState(!!window.jwplayer);
  const scriptUrl = `https://content.jwplatform.com/libraries/${config.player}.js`;
  const enableWatchHistory = config.options.enableContinueWatching && !isTrailer;
  const setPlayer = useOttAnalytics(item, feedId);
  const playlistItemCallback = usePlaylistItemCallback();

  const handlePlaylistItemCallback = useEventCallback(playlistItemCallback);

  const getProgress = useCallback((): VideoProgress | null => {
    if (!playerRef.current) return null;

    const duration = playerRef.current.getDuration();
    const progress = playerRef.current.getPosition() / duration;

    return { duration, progress };
  }, []);

  useWatchHistoryListener(() => (enableWatchHistory ? saveItem(item, getProgress()) : null));

  const handlePlay = useCallback(() => onPlay && onPlay(), [onPlay]);

  const handlePause = useCallback(() => {
    enableWatchHistory && saveItem(item, getProgress());
    onPause && onPause();
  }, [enableWatchHistory, getProgress, item, onPause]);

  const handleComplete = useCallback(() => {
    enableWatchHistory && saveItem(item, getProgress());
    onComplete && onComplete();
  }, [enableWatchHistory, getProgress, item, onComplete]);

  const handleUserActive = useCallback(() => onUserActive && onUserActive(), [onUserActive]);

  const handleUserInactive = useCallback(() => onUserInActive && onUserInActive(), [onUserInActive]);

  useEffect(() => {
    if (!playerRef.current) return;

    playerRef.current.on('complete', handleComplete);
    playerRef.current.on('play', handlePlay);
    playerRef.current.on('pause', handlePause);
    playerRef.current.on('userActive', handleUserActive);
    playerRef.current.on('userInactive', handleUserInactive);

    return () => {
      playerRef.current?.off('complete', handleComplete);
      playerRef.current?.off('play', handlePlay);
      playerRef.current?.off('pause', handlePause);
      playerRef.current?.off('userActive', handleUserActive);
      playerRef.current?.off('userInactive', handleUserInactive);
    };
  }, [handleComplete, handlePause, handlePlay, handleUserActive, handleUserInactive]);

  useEffect(() => {
    if (!window.jwplayer && !loadingRef.current) {
      loadingRef.current = true;

      addScript(scriptUrl).then(() => {
        setLibLoaded(true);
        loadingRef.current = false;
      });
    }
  }, [scriptUrl]);

  useEffect(() => {
    if (!config.player) {
      return;
    }

    const calculateWatchHistoryProgress = () => {
      const { watchHistory } = useWatchHistoryStore.getState();
      const watchHistoryItem = watchHistory.find(({ mediaid }) => mediaid === item.mediaid);

      if (
        watchHistoryItem &&
        enableWatchHistory &&
        watchHistoryItem.progress > VideoProgressMinMax.Min &&
        watchHistoryItem.progress < VideoProgressMinMax.Max
      ) {
        seekToRef.current = watchHistoryItem.progress * watchHistoryItem.duration;
      } else {
        seekToRef.current = -1;
      }
    };

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
      playerRef.current.setConfig({ playlist: [deepCopy(item)], autostart: true });
      calculateWatchHistoryProgress();
    };

    const initializePlayer = () => {
      if (!window.jwplayer || !playerElementRef.current) return;

      playerRef.current = window.jwplayer(playerElementRef.current) as JWPlayer;

      playerRef.current.setup({
        playlist: [deepCopy(item)],
        aspect: false,
        width: '100%',
        height: '100%',
        mute: false,
        autostart: true,
      });

      calculateWatchHistoryProgress();
      setPlayer(playerRef.current);

      const handleBeforePlay = () => {
        if (seekToRef.current > 0) {
          playerRef.current?.seek(seekToRef.current);
          seekToRef.current = -1;
        }
      };

      playerRef.current.on('beforePlay', handleBeforePlay);
      playerRef.current.setPlaylistItemCallback(handlePlaylistItemCallback);
    };

    if (playerRef.current) {
      return loadPlaylist();
    }

    if (libLoaded) {
      initializePlayer();
    }
  }, [libLoaded, item, onPlay, onPause, onUserActive, onUserInActive, onComplete, config.player, enableWatchHistory, setPlayer, handlePlaylistItemCallback]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.remove();
      }
    };
  }, []);

  return (
    <div className={classNames(styles.cinema, { [styles.fill]: !isTrailer })}>
      <div ref={playerElementRef} />
    </div>
  );
};

export default Cinema;
