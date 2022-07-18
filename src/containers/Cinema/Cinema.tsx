import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import styles from './Cinema.module.scss';

import { VideoProgressMinMax } from '#src/config';
import { useWatchHistoryListener } from '#src/hooks/useWatchHistoryListener';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { addScript } from '#src/utils/dom';
import useOttAnalytics from '#src/hooks/useOttAnalytics';
import { deepCopy } from '#src/utils/collection';
import type { JWPlayer } from '#types/jwplayer';
import type { PlaylistItem } from '#types/playlist';
import { saveItem } from '#src/stores/WatchHistoryController';
import { usePlaylistItemCallback } from '#src/hooks/usePlaylistItemCallback';
import useEventCallback from '#src/hooks/useEventCallback';
import { useConfigStore } from '#src/stores/ConfigStore';

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
  const { player, features } = useConfigStore((s) => s.config);
  const continueWatchingList = features?.continueWatchingList;

  const playerElementRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<JWPlayer>();
  const loadingRef = useRef(false);
  const seekToRef = useRef(-1);
  const [libLoaded, setLibLoaded] = useState(!!window.jwplayer);
  const scriptUrl = `${import.meta.env.APP_API_BASE_URL}/libraries/${player}.js`;
  const enableWatchHistory = continueWatchingList && !isTrailer;
  const setPlayer = useOttAnalytics(item, feedId);
  const handlePlaylistItemCallback = usePlaylistItemCallback();

  const getProgress = useCallback((): number | null => {
    if (!playerRef.current) return null;

    const progress = playerRef.current.getPosition() / item.duration;

    return progress;
  }, [item]);

  useWatchHistoryListener(() => (enableWatchHistory ? saveItem(item, getProgress()) : null));

  const handlePlay = useEventCallback(() => {
    onPlay && onPlay();
  });

  const handlePause = useEventCallback(() => {
    enableWatchHistory && saveItem(item, getProgress());
    onPause && onPause();
  });

  const handleComplete = useEventCallback(() => {
    enableWatchHistory && saveItem(item, getProgress());
    onComplete && onComplete();
  });

  const handleUserActive = useEventCallback(() => onUserActive && onUserActive());

  const handleUserInactive = useEventCallback(() => onUserInActive && onUserInActive());

  const handleBeforePlay = useEventCallback(() => {
    if (seekToRef.current > 0) {
      playerRef.current?.seek(seekToRef.current);
      seekToRef.current = -1;
    }
  });

  const attachEvents = useCallback(() => {
    playerRef.current?.on('beforePlay', handleBeforePlay);
    playerRef.current?.on('complete', handleComplete);
    playerRef.current?.on('play', handlePlay);
    playerRef.current?.on('pause', handlePause);
    playerRef.current?.on('userActive', handleUserActive);
    playerRef.current?.on('userInactive', handleUserInactive);
  }, [playerRef, handleComplete, handlePlay, handlePause, handleUserActive, handleUserInactive, handleBeforePlay]);

  const detachEvents = useCallback(() => {
    playerRef.current?.off('complete');
    playerRef.current?.off('play');
    playerRef.current?.off('pause');
    playerRef.current?.off('userActive');
    playerRef.current?.off('userInactive');
  }, []);

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
    if (!player) {
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
      playerRef.current.load([deepCopy(item)]);
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
        repeat: false,
      });

      attachEvents();
      calculateWatchHistoryProgress();
      setPlayer(playerRef.current);

      playerRef.current.setPlaylistItemCallback(handlePlaylistItemCallback);
    };

    if (playerRef.current) {
      return loadPlaylist();
    }

    if (libLoaded) {
      initializePlayer();
    }
  }, [libLoaded, item, enableWatchHistory, setPlayer, handlePlaylistItemCallback, detachEvents, attachEvents, player]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        // Detaching events before component unmount
        detachEvents();
        playerRef.current.remove();
      }
    };
  }, [detachEvents]);

  return (
    <div className={classNames(styles.cinema, { [styles.fill]: !isTrailer })}>
      <div ref={playerElementRef} />
    </div>
  );
};

export default Cinema;
