import React, { useContext, useEffect, useState } from 'react';
import type { Config } from 'types/Config';
import type { PlaylistItem } from 'types/playlist';
import type { VideoProgress } from 'types/video';

import { watchHistoryStore, useWatchHistoryUpdater } from '../../stores/WatchHistoryStore';
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

  const getProgress = (): VideoProgress => {
    const player = window.jwplayer && (window.jwplayer('cinema') as jwplayer.JWPlayer);

    return (
      player &&
      ({
        duration: player.getDuration(),
        progress: player.getPosition() / player.getDuration(),
      } as VideoProgress)
    );
  };
  const watchHistory = watchHistoryStore.useState((state) => state.watchHistory);
  const updateWatchHistory = useWatchHistoryUpdater(item, getProgress);

  useEffect(() => {
    const getPlayer = () => window.jwplayer && (window.jwplayer('cinema') as jwplayer.JWPlayer);
    const loadVideo = () => {
      const player = getPlayer();
      player.setup({ file, image: item.image, title: item.title, autostart: 'viewable' });
      player.on('play', () => onPlay && onPlay());
      player.on('pause', () => onPause && onPause());
      player.on('beforePlay', () => {
        const { watchHistory } = watchHistoryStore.getRawState();
        const watchHistoryItem = watchHistory.find(({ mediaid }) => mediaid === item.mediaid);
        const { progress, duration } = watchHistoryItem || {};
        progress && duration && player.seek(duration * progress);

        // Todo: watchhistory might be finished loading later than this point
      });
    };

    if (config.player && !initialized) {
      getPlayer() ? loadVideo() : addScript(scriptUrl, loadVideo);
      setInitialized(true);
    }
  }, [item, onPlay, onPause, config.player, file, scriptUrl, initialized, watchHistory, updateWatchHistory]);

  return <div className={styles.Cinema} id="cinema" />;
};

export default Cinema;
