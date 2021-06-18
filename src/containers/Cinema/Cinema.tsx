import React, { useContext, useEffect, useState } from 'react';
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

type Props = {
  item: PlaylistItem;
  onPlay?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onUserActive?: () => void;
  onUserInActive?: () => void;
  isTrailer?: boolean;
};

const Cinema: React.FC<Props> = ({
  item,
  onPlay,
  onPause,
  onComplete,
  onUserActive,
  onUserInActive,
  isTrailer = false,
}: Props) => {
  const config: Config = useContext(ConfigContext);
  const [initialized, setInitialized] = useState(false);
  const file = item.sources?.[0]?.file;
  const scriptUrl = `https://content.jwplatform.com/libraries/${config.player}.js`;
  const enableWatchHistory = config.options.enableContinueWatching && !isTrailer;
  const setPlayer = useOttAnalytics(item);

  const getProgress = (): VideoProgress | null => {
    const player = window.jwplayer && (window.jwplayer('cinema') as JWPlayer);
    if (!player) return null;

    const duration = player.getDuration();
    const progress = player.getPosition() / duration;

    return { duration, progress } as VideoProgress;
  };
  const { saveItem } = useWatchHistory();
  useWatchHistoryListener(() => (enableWatchHistory ? saveItem(item, getProgress) : null));

  useEffect(() => {
    const getPlayer = () => window.jwplayer && (window.jwplayer('cinema') as JWPlayer);
    const loadVideo = () => {
      const player = getPlayer();
      const { watchHistory } = watchHistoryStore.getRawState();
      const watchHistoryItem = watchHistory.find(({ mediaid }) => mediaid === item.mediaid);
      let applyWatchHistory = !!watchHistory && enableWatchHistory;

      player.setup({ file, image: item.image, title: item.title, autostart: 'viewable' });
      setPlayer(player);
      player.on('play', () => onPlay && onPlay());
      player.on('pause', () => onPause && onPause());
      player.on('beforePlay', () => {
        if (applyWatchHistory) {
          applyWatchHistory = false; // Only the first time beforePlay
          const { progress, duration } = watchHistoryItem || {};
          if (progress && duration && progress > VideoProgressMinMax.Min && progress < VideoProgressMinMax.Max) {
            player.seek(duration * progress);
          }
        }
      });
      player.on('complete', () => onComplete && onComplete());
      player.on('userActive', () => onUserActive && onUserActive());
      player.on('userInactive', () => onUserInActive && onUserInActive());
    };

    if (config.player && !initialized) {
      getPlayer() ? loadVideo() : addScript(scriptUrl, loadVideo);
      setInitialized(true);
    }
  }, [
    item,
    onPlay,
    onPause,
    onComplete,
    onUserActive,
    onUserInActive,
    config.player,
    file,
    scriptUrl,
    initialized,
    enableWatchHistory,
    setPlayer,
  ]);

  return <div id="cinema" />;
};

export default Cinema;
