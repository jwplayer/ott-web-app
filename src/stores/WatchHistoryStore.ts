import { VideoProgressMinMax, DAY_IN_MS, BECAUSE_YOU_WATCHED_MAX_PERIOD } from '../config';
import { Shelf } from '../enum/PersonalShelf';

import { createStore } from './utils';

import type { WatchHistoryItem } from '#types/watchHistory';
import type { Playlist, PlaylistItem } from '#types/playlist';

type WatchHistoryState = {
  watchHistory: WatchHistoryItem[];
  playlistItemsLoaded: boolean;
  getItem: (item: PlaylistItem) => WatchHistoryItem | undefined;
  getPlaylist: () => Playlist;
  getWatchedItem: () => PlaylistItem | undefined;
  getDictionary: () => { [key: string]: number };
};

export const useWatchHistoryStore = createStore<WatchHistoryState>('WatchHistoryStore', (_, get) => ({
  watchHistory: [],
  playlistItemsLoaded: false,
  getItem: (item: PlaylistItem) =>
    get().watchHistory.find(({ mediaid, progress }) => {
      return mediaid === item.mediaid && progress > VideoProgressMinMax.Min && progress < VideoProgressMinMax.Max;
    }),
  getPlaylist: () =>
    ({
      feedid: Shelf.ContinueWatching,
      title: 'Continue watching',
      playlist: get()
        .watchHistory.filter(({ playlistItem, progress }) => !!playlistItem && progress > VideoProgressMinMax.Min && progress < VideoProgressMinMax.Max)
        .map(({ playlistItem }) => playlistItem),
    } as Playlist),
  getDictionary: () =>
    get().watchHistory.reduce((dict: { [key: string]: number }, item) => {
      dict[item.mediaid] = item.progress;

      return dict;
    }, {}),
  getWatchedItem: () => {
    const playlist = get().watchHistory.find(({ playlistItem, progress, lastTimeWatched }) => {
      // We need only an item watched not more than 60 days ago
      const hasMaxPeriodExpired = !lastTimeWatched || (Date.now() - lastTimeWatched) / DAY_IN_MS > BECAUSE_YOU_WATCHED_MAX_PERIOD;

      return !!playlistItem && progress > VideoProgressMinMax.Max && !hasMaxPeriodExpired;
    });

    return playlist?.playlistItem;
  },
}));
