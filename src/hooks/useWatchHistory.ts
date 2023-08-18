import { useMemo } from 'react';

import type { PlaylistItem } from '#types/playlist';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { VideoProgressMinMax } from '#src/config';
import { useWatchHistoryListener } from '#src/hooks/useWatchHistoryListener';
import type { JWPlayer } from '#types/jwplayer';

export const useWatchHistory = (player: JWPlayer | undefined, item: PlaylistItem, seriesItem?: PlaylistItem) => {
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
