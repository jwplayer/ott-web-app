import { createStore } from './utils';

import { VideoProgressMinMax } from '#src/config';
import { PersonalShelf } from '#src/stores/ConfigStore';
import type { WatchHistoryItem } from '#types/watchHistory';
import type { Playlist, PlaylistItem } from '#types/playlist';

type WatchHistoryState = {
  watchHistory: WatchHistoryItem[];
  playlistItemsLoaded: boolean;
  continueWatchingPlaylistId: string;
  getItem: (item: PlaylistItem) => WatchHistoryItem | undefined;
  getPlaylist: () => Playlist;
  getDictionaryWithEpisodes: () => { [key: string]: number };
  getDictionaryWithSeries: () => { [key: string]: number };
};

export const useWatchHistoryStore = createStore<WatchHistoryState>('WatchHistoryStore', (_, get) => ({
  watchHistory: [],
  playlistItemsLoaded: false,
  continueWatchingPlaylistId: PersonalShelf.ContinueWatching,
  getItem: (item: PlaylistItem) =>
    get().watchHistory.find(({ mediaid, progress }) => {
      return mediaid === item.mediaid && progress > VideoProgressMinMax.Min && progress < VideoProgressMinMax.Max;
    }),
  getPlaylist: () =>
    ({
      feedid: get().continueWatchingPlaylistId || PersonalShelf.ContinueWatching,
      title: 'Continue watching',
      playlist: get()
        .watchHistory.filter(({ playlistItem, progress }) => !!playlistItem && progress > VideoProgressMinMax.Min && progress < VideoProgressMinMax.Max)
        .map(({ playlistItem }) => playlistItem),
    } as Playlist),
  getDictionaryWithEpisodes: () =>
    get().watchHistory.reduce((dict: { [key: string]: number }, item) => {
      const key = item.mediaid;

      dict[key] = item.progress;

      return dict;
    }, {}),
  getDictionaryWithSeries: () =>
    get().watchHistory.reduce((dict: { [key: string]: number }, item) => {
      const key = item.seriesId || item.mediaid;

      dict[key] = item.progress;

      return dict;
    }, {}),
}));
