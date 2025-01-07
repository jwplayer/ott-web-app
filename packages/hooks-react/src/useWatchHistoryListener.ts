import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import WatchHistoryController from '@jwp/ott-common/src/controllers/WatchHistoryController';

import useEventCallback from './useEventCallback';

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
export const useWatchHistoryListener = (item: PlaylistItem, seriesItem?: PlaylistItem) => {
  const queuedWatchProgress = useRef<QueuedProgress | null>(null);
  const watchHistoryController = getModule(WatchHistoryController);

  // config
  const { features } = useConfigStore((s) => s.config);
  const continueWatchingList = features?.continueWatchingList;
  const watchHistoryEnabled = !!continueWatchingList;

  // maybe store the watch progress when we have a queued watch progress
  const saveWatchProgress = useCallback(() => {
    if (!watchHistoryEnabled || !queuedWatchProgress.current) return;

    const { item, seriesItem, progress } = queuedWatchProgress.current;

    // save the queued watch progress
    watchHistoryController.saveItem(item, seriesItem, progress);

    // clear the queue
    queuedWatchProgress.current = null;
  }, [watchHistoryEnabled, watchHistoryController]);

  // update the queued watch progress on each time update event
  const handleTimeUpdate = useEventCallback(({ position, duration }: { position: number; duration: number }) => {
    // live streams have a negative duration, we ignore these for now
    if (duration < 0) return;

    const progress = Number((position / duration).toFixed(5));

    if (!isNaN(progress) && isFinite(progress)) {
      queuedWatchProgress.current = {
        item,
        seriesItem,
        progress,
        timestamp: queuedWatchProgress.current?.timestamp || Date.now(),
      };

      // save the progress when we haven't done so in the last X minutes
      if (Date.now() - queuedWatchProgress.current.timestamp > PROGRESSIVE_SAVE_INTERVAL) {
        saveWatchProgress();
      }
    }
  });

  useEffect(() => {
    return () => {
      // store watch progress on unmount and when the media item changes
      saveWatchProgress();
    };
  }, [item?.mediaid, saveWatchProgress]);

  // add event listeners for unload and visibility change to ensure the latest watch progress is saved
  useLayoutEffect(() => {
    const visibilityListener = () => document.visibilityState === 'hidden' && saveWatchProgress();

    window.addEventListener('pagehide', saveWatchProgress);
    window.addEventListener('visibilitychange', visibilityListener);

    return () => {
      window.removeEventListener('pagehide', saveWatchProgress);
      window.removeEventListener('visibilitychange', visibilityListener);
    };
  }, [saveWatchProgress]);

  return {
    saveWatchProgress,
    handleTimeUpdate,
  };
};
