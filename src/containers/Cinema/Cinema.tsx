import React, { useContext, useEffect, useState } from 'react';
import type { Config } from 'types/Config';
import type { PlaylistItem } from 'types/playlist';

import { WatchHistoryStore, useWatchHistoryUpdater, WatchHistoryItem } from '../../store/WatchHistoryStore';
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
  const continueTillPercentage = 0.95;

  const createWatchHistoryItem = (): WatchHistoryItem | undefined => {
    const player = window.jwplayer && (window.jwplayer('cinema') as jwplayer.JWPlayer);

    if (!player) return;

    return {
      mediaid: item.mediaid,
      position: player.getPosition(),
    } as WatchHistoryItem;
  };
  const watchHistory = WatchHistoryStore.useState((state) => state.watchHistory);
  const updateWatchHistory = useWatchHistoryUpdater(createWatchHistoryItem);

  useEffect(() => {
    const getPlayer = () => window.jwplayer && (window.jwplayer('cinema') as jwplayer.JWPlayer);
    const loadVideo = () => {
      const player = getPlayer();
      const position = watchHistory.find((historyItem) => historyItem.mediaid === item.mediaid)?.position;
      player.setup({ file });
      player.on('ready', () => {
        if (position && position < player.getDuration() * continueTillPercentage) {
          player.seek(position);
        }
        player.play();
      });
      player.on('play', () => onPlay && onPlay());
      player.on('pause', () => onPause && onPause());
    };

    if (config.player && !initialized) {
      getPlayer() ? loadVideo() : addScript(scriptUrl, loadVideo);
      setInitialized(true);
    }
  }, [item.mediaid, onPlay, onPause, config.player, file, scriptUrl, initialized, watchHistory, updateWatchHistory]);

  return <div className={styles.Cinema} id="cinema" />;
};

export default Cinema;
