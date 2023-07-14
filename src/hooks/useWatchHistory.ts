import { MutableRefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import type { JWPlayer } from '#types/jwplayer';
import type { PlaylistItem } from '#types/playlist';
import useEventCallback from '#src/hooks/useEventCallback';
import { saveItem } from '#src/stores/WatchHistoryController';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { VideoProgressMinMax } from '#src/config';

type QueuedProgress = {
  item: PlaylistItem;
  progress: number;
};

/**
 * The `useWatchHistory` hook has two responsibilities.
 *
 * 1. Determine the `startTime` of the given `item` (return value)
 * 2. Save the watch progress of the current `item` to the user profile
 *
 * __The problem:__
 *
 * There are multiple events that trigger a save. This results in duplicate (unnecessary) saves and API calls. Another
 * problem is that some events are triggered when the `item` to update has changed. For example, when clicking a media
 * item in the "Related shelf". This causes the wrong item to be saved in the watch history.
 *
 * __The solution:__
 *
 * This hook listens to the player time update event and queues a watch history entry with the current progress and
 * item. When this needs to be saved, the queue is used to look up the last progress and item and save it when
 * necessary. The queue is then cleared to prevent duplicate saves and API calls.
 *
 * @param player
 * @param item
 */
export const useWatchHistory = (player: JWPlayer | undefined, item: PlaylistItem) => {
  const queuedWatchProgress = useRef<QueuedProgress | null>(null) as MutableRefObject<QueuedProgress | null>;

  // config
  const { features } = useConfigStore((s) => s.config);
  const continueWatchingList = features?.continueWatchingList;
  const watchHistoryEnabled = !!continueWatchingList;

  // watch History
  const watchHistoryItem = useWatchHistoryStore((state) => (!!item && watchHistoryEnabled ? state.getItem(item) : undefined));

  // update the queued watch progress on each time update event
  const handleTimeUpdate = useEventCallback(() => {
    if (!player) return;

    const progress = player.getPosition() / item.duration;

    if (!isNaN(progress) && isFinite(progress)) {
      queuedWatchProgress.current = {
        item,
        progress,
      };
    }
  });

  // maybe store the watch progress when we have a queued watch progress
  const maybeSaveWatchProgress = useCallback(() => {
    if (!watchHistoryEnabled || !queuedWatchProgress.current) return;

    const { item, progress } = queuedWatchProgress.current;

    // save the queued watch progress
    saveItem(item, progress);

    // clear the queue
    queuedWatchProgress.current = null;
  }, [watchHistoryEnabled]);

  // listen for certain player events
  useEffect(() => {
    if (!player || !watchHistoryEnabled) return;

    player.on('time', handleTimeUpdate);
    player.on('pause', maybeSaveWatchProgress);
    player.on('complete', maybeSaveWatchProgress);
    player.on('remove', maybeSaveWatchProgress);

    return () => {
      player.off('time', handleTimeUpdate);
      player.off('pause', maybeSaveWatchProgress);
      player.off('complete', maybeSaveWatchProgress);
      player.off('remove', maybeSaveWatchProgress);
    };
  }, [player, watchHistoryEnabled, maybeSaveWatchProgress, handleTimeUpdate]);

  useEffect(() => {
    return () => {
      // store watch progress on unmount and when the media item changes
      maybeSaveWatchProgress();
    };
  }, [item?.mediaid, maybeSaveWatchProgress]);

  // add event listeners for unload and visibility change to ensure the latest watch progress is saved
  useLayoutEffect(() => {
    const visibilityListener = () => document.visibilityState === 'hidden' && maybeSaveWatchProgress();

    window.addEventListener('beforeunload', maybeSaveWatchProgress);
    window.addEventListener('visibilitychange', visibilityListener);

    return () => {
      window.removeEventListener('beforeunload', maybeSaveWatchProgress);
      window.removeEventListener('visibilitychange', visibilityListener);
    };
  }, [maybeSaveWatchProgress]);

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
