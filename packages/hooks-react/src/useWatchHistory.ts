import { useMemo } from 'react';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useWatchHistoryStore } from '@jwp/ott-common/src/stores/WatchHistoryStore';
import { VideoProgressMinMax } from '@jwp/ott-common/src/constants';

import { useWatchHistoryListener } from './useWatchHistoryListener';

export const useWatchHistory = (player: jwplayer.JWPlayer | undefined, item: PlaylistItem, seriesItem?: PlaylistItem) => {
  // config
  const { features } = useConfigStore((s) => s.config);
  const continueWatchingList = features?.continueWatchingList;
  const watchHistoryEnabled = !!continueWatchingList;

  // watch history listener
  useWatchHistoryListener(player, item, seriesItem);

  // watch History
  const watchHistoryItem = useWatchHistoryStore((state) => (!!item && watchHistoryEnabled ? state.getItem(item) : undefined));

  // calculate the `startTime` of the current item based on the watch progress
  return useMemo(() => {
    const videoProgress = watchHistoryItem?.progress;

    if (videoProgress && videoProgress > VideoProgressMinMax.Min && videoProgress < VideoProgressMinMax.Max) {
      return videoProgress * item.duration;
    }

    // start at the beginning of the video (only for VOD content)
    return 0;
  }, [item.duration, watchHistoryItem?.progress]);
};
