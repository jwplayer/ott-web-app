import React, { useContext, useEffect, useState } from 'react';
import type { Config } from 'types/Config';
import type { PlaylistItem } from 'types/playlist';
import type { VideoProgress } from 'types/video';

import { useWatchHistoryListener } from '../../hooks/useWatchHistoryListener';
import { watchHistoryStore, useWatchHistory } from '../../stores/WatchHistoryStore';
import { ConfigContext } from '../../providers/ConfigProvider';
import { addScript } from '../../utils/dom';

import styles from './Cinema.module.scss';

type Props = {
  item: PlaylistItem;
  onPlay?: () => void;
  onPause?: () => void;
};

const Cinema: React.FC<Props> = ({ item, onPlay, onPause }: Props) => {
  const config: Config = useContext(ConfigContext);
  const [initialized, setInitialized] = useState(false);
  const file = item.sources[0]?.file;
  const scriptUrl = `https://content.jwplatform.com/libraries/${config.player}.js`;

  const getProgress = (): VideoProgress | null => {
    const player = window.jwplayer && (window.jwplayer('cinema') as jwplayer.JWPlayer);
    if (!player) return null;

    const duration = player.getDuration();
    const progress = player.getPosition() / duration;

    return { duration, progress } as VideoProgress;
  };
  const { saveItem } = useWatchHistory();
  useWatchHistoryListener(() => saveItem(item, getProgress));

  useEffect(() => {
    const getPlayer = () => window.jwplayer && (window.jwplayer('cinema') as jwplayer.JWPlayer);
    const loadVideo = () => {
      const player = getPlayer();
      const { watchHistory } = watchHistoryStore.getRawState();
      const watchHistoryItem = watchHistory.find(({ mediaid }) => mediaid === item.mediaid);
      let applyWatchHistory = !!watchHistory;

      player.setup({ file, image: item.image, title: item.title, autostart: 'viewable' });
      player.on('play', () => onPlay && onPlay());
      player.on('pause', () => onPause && onPause());
      player.on('beforePlay', () => {
        if (applyWatchHistory) {
          applyWatchHistory = false; // Only the first time beforePlay
          const { progress, duration } = watchHistoryItem || {};
          progress && duration && player.seek(duration * progress);
        }
      });
    };

    if (config.player && !initialized) {
      getPlayer() ? loadVideo() : addScript(scriptUrl, loadVideo);
      setInitialized(true);
    }
  }, [item, onPlay, onPause, config.player, file, scriptUrl, initialized]);

  return <div className={styles.Cinema} id="cinema" />;
};

export default Cinema;
