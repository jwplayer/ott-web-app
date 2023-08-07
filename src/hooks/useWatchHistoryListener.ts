import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import type { JWPlayer } from '#types/jwplayer';
import type { PlaylistItem } from '#types/playlist';
import useEventCallback from '#src/hooks/useEventCallback';
import { saveItem } from '#src/stores/WatchHistoryController';
import { useConfigStore } from '#src/stores/ConfigStore';

type QueuedProgress = {
  item: PlaylistItem;
  seriesItem?: PlaylistItem;
  progress: number;
  timestamp: number;
};

const PROGRESSIVE_SAVE_INTERVAL = 300_000; // 5 minutes

/**
 * The `useWatchHistoryListener` hook has the responsibility to save the players watch progress on key moments.
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
 */
export const useWatchHistoryListener = (player: JWPlayer | undefined, item: PlaylistItem, seriesItem?: PlaylistItem) => {
  const queuedWatchProgress = useRef<QueuedProgress | null>(null);

  // config
  const { features } = useConfigStore((s) => s.config);
  const continueWatchingList = features?.continueWatchingList;
  const watchHistoryEnabled = !!continueWatchingList;

  // maybe store the watch progress when we have a queued watch progress
  const maybeSaveWatchProgress = useCallback(() => {
    if (!watchHistoryEnabled || !queuedWatchProgress.current) return;

    const { item, seriesItem, progress } = queuedWatchProgress.current;

    // save the queued watch progress
    saveItem(item, seriesItem, progress);

    // clear the queue
    queuedWatchProgress.current = null;
  }, [watchHistoryEnabled]);

  // update the queued watch progress on each time update event
  const handleTimeUpdate = useEventCallback((event: jwplayer.TimeParam) => {
    // live streams have a negative duration, we ignore these for now
    if (event.duration < 0) return;

    const progress = event.position / event.duration;

    if (!isNaN(progress) && isFinite(progress)) {
      queuedWatchProgress.current = {
        item,
        seriesItem,
        progress,
        timestamp: queuedWatchProgress.current?.timestamp || Date.now(),
      };

      // save the progress when we haven't done so in the last X minutes
      if (Date.now() - queuedWatchProgress.current.timestamp > PROGRESSIVE_SAVE_INTERVAL) {
        maybeSaveWatchProgress();
      }
    }
  });

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

    window.addEventListener('pagehide', maybeSaveWatchProgress);
    window.addEventListener('visibilitychange', visibilityListener);

    return () => {
      window.removeEventListener('pagehide', maybeSaveWatchProgress);
      window.removeEventListener('visibilitychange', visibilityListener);
    };
  }, [maybeSaveWatchProgress]);
};
