import { injectable } from 'inversify';

import ApiService from './api.service';

import * as persist from '#src/utils/persist';
import type { PlaylistItem } from '#types/playlist';
import type { SerializedWatchHistoryItem, WatchHistoryItem } from '#types/watchHistory';
import type { Customer } from '#types/account';

@injectable()
export default class WatchHistoryService {
  private PERSIST_KEY_WATCH_HISTORY = `history${window.configId ? `-${window.configId}` : ''}`;
  private MAX_WATCH_HISTORY_COUNT = 48;
  private readonly apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  // Retrieve watch history media items info using a provided watch list
  private getWatchHistoryItems = async (continueWatchingList: string, ids: string[]): Promise<Record<string, PlaylistItem>> => {
    const watchHistoryItems = await this.apiService.getMediaByWatchlist(continueWatchingList, ids);
    const watchHistoryItemsDict = Object.fromEntries((watchHistoryItems || []).map((item) => [item.mediaid, item]));

    return watchHistoryItemsDict;
  };

  // We store separate episodes in the watch history and to show series card in the Continue Watching shelf we need to get their parent media items
  private getWatchHistorySeriesItems = async (continueWatchingList: string, ids: string[]): Promise<Record<string, PlaylistItem | undefined>> => {
    const mediaWithSeries = await this.apiService.getSeriesByMediaIds(ids);
    const seriesIds = Object.keys(mediaWithSeries || {})
      .map((key) => mediaWithSeries?.[key]?.[0]?.series_id)
      .filter(Boolean) as string[];

    const seriesItems = await this.apiService.getMediaByWatchlist(continueWatchingList, seriesIds);
    const seriesItemsDict = Object.keys(mediaWithSeries || {}).reduce((acc, key) => {
      const seriesItemId = mediaWithSeries?.[key]?.[0]?.series_id;
      if (seriesItemId) {
        acc[key] = seriesItems?.find((el) => el.mediaid === seriesItemId);
      }
      return acc;
    }, {} as Record<string, PlaylistItem | undefined>);

    return seriesItemsDict;
  };

  getWatchHistory = async (user: Customer | null, continueWatchingList: string) => {
    const savedItems = user ? user.externalData?.history : persist.getItem<WatchHistoryItem[]>(this.PERSIST_KEY_WATCH_HISTORY);

    if (savedItems?.length) {
      // When item is an episode of the new flow -> show the card as a series one, but keep episode to redirect in a right way
      const ids = savedItems.map(({ mediaid }) => mediaid);

      const watchHistoryItems = await this.getWatchHistoryItems(continueWatchingList, ids);
      const seriesItems = await this.getWatchHistorySeriesItems(continueWatchingList, ids);

      const watchHistory = savedItems.map((item) => {
        const parentSeries = seriesItems?.[item.mediaid];
        const historyItem = watchHistoryItems[item.mediaid];

        if (historyItem) {
          return this.createWatchHistoryItem(parentSeries || historyItem, item.mediaid, parentSeries?.mediaid, item.progress);
        }
      });

      return watchHistory;
    }
  };

  serializeWatchHistory = (watchHistory: WatchHistoryItem[]): SerializedWatchHistoryItem[] =>
    watchHistory.map(({ mediaid, progress }) => ({
      mediaid,
      progress,
    }));

  persistWatchHistory = (watchHistory: WatchHistoryItem[]) => {
    persist.setItem(this.PERSIST_KEY_WATCH_HISTORY, this.serializeWatchHistory(watchHistory));
  };

  /** Use mediaid of originally watched movie / episode.
   * A playlistItem can be either a series item (to show series card) or media item
   * */
  createWatchHistoryItem = (item: PlaylistItem, mediaid: string, seriesId: string | undefined, videoProgress: number): WatchHistoryItem => {
    return {
      mediaid,
      seriesId,
      title: item.title,
      tags: item.tags,
      duration: item.duration,
      progress: videoProgress,
      playlistItem: item,
    } as WatchHistoryItem;
  };

  /**
   *  If we already have an element with continue watching state, we:
   *    1. Update the progress
   *    2. Move the element to the continue watching list start
   *  Otherwise:
   *    1. Move the element to the continue watching list start
   *    2. If there are many elements in continue watching state we remove the oldest one
   */
  saveItem = async (item: PlaylistItem, seriesItem: PlaylistItem | undefined, videoProgress: number | null, watchHistory: WatchHistoryItem[]) => {
    if (!videoProgress) return;

    const watchHistoryItem = this.createWatchHistoryItem(seriesItem || item, item.mediaid, seriesItem?.mediaid, videoProgress);
    // filter out the existing watch history item, so we can add it to the beginning of the list
    const updatedHistory = watchHistory.filter(({ mediaid, seriesId }) => {
      return mediaid !== watchHistoryItem.mediaid && (!seriesId || seriesId !== watchHistoryItem.seriesId);
    });

    updatedHistory.unshift(watchHistoryItem);

    updatedHistory.splice(this.MAX_WATCH_HISTORY_COUNT);

    return updatedHistory;
  };
}
