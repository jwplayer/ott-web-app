import { inject, injectable } from 'inversify';
import { array, number, object, string } from 'yup';

import type { PlaylistItem } from '../../types/playlist';
import type { SerializedWatchHistoryItem, WatchHistoryItem } from '../../types/watchHistory';
import type { Customer } from '../../types/account';
import { getNamedModule } from '../modules/container';
import { INTEGRATION_TYPE } from '../modules/types';
import { logDev } from '../utils/common';
import { MAX_WATCHLIST_ITEMS_COUNT } from '../constants';

import ApiService from './ApiService';
import StorageService from './StorageService';
import AccountService from './integrations/AccountService';

const schema = array(
  object().shape({
    mediaid: string(),
    progress: number(),
  }),
);

@injectable()
export default class WatchHistoryService {
  private PERSIST_KEY_WATCH_HISTORY = 'history';

  private readonly apiService;
  private readonly storageService;
  private readonly accountService;

  constructor(@inject(INTEGRATION_TYPE) integrationType: string, apiService: ApiService, storageService: StorageService) {
    this.apiService = apiService;
    this.storageService = storageService;
    this.accountService = getNamedModule(AccountService, integrationType);
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
    const uniqueSerieIds = [...new Set(seriesIds)];

    const seriesItems = await this.apiService.getMediaByWatchlist(continueWatchingList, uniqueSerieIds);
    const seriesItemsDict = Object.keys(mediaWithSeries || {}).reduce((acc, key) => {
      const seriesItemId = mediaWithSeries?.[key]?.[0]?.series_id;
      if (seriesItemId) {
        acc[key] = seriesItems?.find((el) => el.mediaid === seriesItemId);
      }
      return acc;
    }, {} as Record<string, PlaylistItem | undefined>);

    return seriesItemsDict;
  };

  private validateWatchHistory(history: unknown) {
    if (history && schema.validateSync(history)) {
      return history as SerializedWatchHistoryItem[];
    }

    return [];
  }

  private async getWatchHistoryFromAccount(user: Customer) {
    const history = await this.accountService.getWatchHistory({ user });

    return this.validateWatchHistory(history);
  }

  private async getWatchHistoryFromStorage() {
    const history = await this.storageService.getItem(this.PERSIST_KEY_WATCH_HISTORY, true);

    return this.validateWatchHistory(history);
  }

  getWatchHistory = async (user: Customer | null, continueWatchingList: string) => {
    const savedItems = user ? await this.getWatchHistoryFromAccount(user) : await this.getWatchHistoryFromStorage();

    // When item is an episode of the new flow -> show the card as a series one, but keep episode to redirect in a right way
    const ids = savedItems.map(({ mediaid }) => mediaid);

    if (!ids.length) {
      return [];
    }

    try {
      const watchHistoryItems = await this.getWatchHistoryItems(continueWatchingList, ids);
      const seriesItems = await this.getWatchHistorySeriesItems(continueWatchingList, ids);

      return savedItems
        .map((item) => {
          const parentSeries = seriesItems?.[item.mediaid];
          const historyItem = watchHistoryItems[item.mediaid];

          if (historyItem) {
            return this.createWatchHistoryItem(parentSeries || historyItem, item.mediaid, parentSeries?.mediaid, item.progress);
          }
        })
        .filter((item): item is WatchHistoryItem => Boolean(item));
    } catch (error: unknown) {
      logDev('Failed to get watch history items', error);
    }

    return [];
  };

  serializeWatchHistory = (watchHistory: WatchHistoryItem[]): SerializedWatchHistoryItem[] =>
    watchHistory.map(({ mediaid, progress }) => ({
      mediaid,
      progress,
    }));

  persistWatchHistory = async (watchHistory: WatchHistoryItem[], user: Customer | null) => {
    if (user) {
      await this.accountService?.updateWatchHistory({
        history: this.serializeWatchHistory(watchHistory),
        user,
      });
    } else {
      await this.storageService.setItem(this.PERSIST_KEY_WATCH_HISTORY, JSON.stringify(this.serializeWatchHistory(watchHistory)));
    }
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

  getMaxWatchHistoryCount = () => {
    return this.accountService?.features?.watchListSizeLimit || MAX_WATCHLIST_ITEMS_COUNT;
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
    updatedHistory.splice(this.getMaxWatchHistoryCount());

    return updatedHistory;
  };
}
