import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Config } from 'types/Config';
import type { PlaylistItem } from 'types/playlist';
import type { VideoProgress } from 'types/video';
import type { JWPlayer } from 'types/jwplayer';
import classNames from 'classnames';

import { VideoProgressMinMax } from '../../config';
import { useWatchHistoryListener } from '../../hooks/useWatchHistoryListener';
import { watchHistoryStore, useWatchHistory } from '../../stores/WatchHistoryStore';
import { ConfigContext } from '../../providers/ConfigProvider';
import { addScript } from '../../utils/dom';
import useOttAnalytics from '../../hooks/useOttAnalytics';

import styles from './Cinema.module.scss';
import { fetchMediaById } from '../../services/api.service';
import { deepCopy } from '../../utils/collection';

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

  const getProgress = (): VideoProgress | null => {
    if (!playerRef.current) return null;

    const duration = playerRef.current.getDuration();
    const progress = playerRef.current.getPosition() / duration;

    return { duration, progress } as VideoProgress;
  };

  const { saveItem } = useWatchHistory();
  useWatchHistoryListener(() => (enableWatchHistory ? saveItem(item, getProgress) : null));

  const handlePlay = useCallback(() => onPlay && onPlay(), [onPlay]);

  const handlePause = useCallback(() => {
    enableWatchHistory && saveItem(item, getProgress);
    onPause && onPause();
  }, [enableWatchHistory, item, onPause, saveItem]);

  const handleComplete = useCallback(() => {
    enableWatchHistory && saveItem(item, getProgress);
    onComplete && onComplete();
  }, [enableWatchHistory, item, onComplete, saveItem]);

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
      const { watchHistory } = watchHistoryStore.getRawState();
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
      fetchMediaById(item.mediaid).then((itemToPlay) => {
        if (!item || !playerRef.current) {
          return;
        }

        const currentItem = playerRef.current?.getPlaylistItem() as PlaylistItem | null;

        // we already loaded this item
        if (currentItem && currentItem.mediaid === item.mediaid) {
          return;
        }

        // load new item
        playerRef.current.setConfig({ playlist: [deepCopy(itemToPlay)], autostart: true });
        calculateWatchHistoryProgress();
      });
    };

    const initializePlayer = () => {
      fetchMediaById(item.mediaid).then((itemToPlay) => {
        if (!window.jwplayer || !playerElementRef.current) return;

        playerRef.current = window.jwplayer(playerElementRef.current) as JWPlayer;

        playerRef.current.setup({
          playlist: [deepCopy(itemToPlay)],
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
      });
    };

    if (playerRef.current) {
      return loadPlaylist();
    }

    if (libLoaded) {
      initializePlayer();
    }
  }, [libLoaded, item, onPlay, onPause, onUserActive, onUserInActive, onComplete, config.player, enableWatchHistory, setPlayer, saveItem]);

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
