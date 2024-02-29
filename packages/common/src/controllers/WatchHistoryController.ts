import { injectable } from 'inversify';

import WatchHistoryService from '../services/WatchHistoryService';
import type { PlaylistItem } from '../../types/playlist';
import type { WatchHistoryItem } from '../../types/watchHistory';
import { useAccountStore } from '../stores/AccountStore';
import { useConfigStore } from '../stores/ConfigStore';
import { useWatchHistoryStore } from '../stores/WatchHistoryStore';

@injectable()
export default class WatchHistoryController {
  private readonly watchHistoryService: WatchHistoryService;

  constructor(watchHistoryService: WatchHistoryService) {
    this.watchHistoryService = watchHistoryService;
  }

  initialize = async () => {
    await this.restoreWatchHistory();
  };

  restoreWatchHistory = async () => {
    const { user } = useAccountStore.getState();
    const continueWatchingList = useConfigStore.getState().config.features?.continueWatchingList;

    if (!continueWatchingList) {
      return;
    }

    const watchHistory = await this.watchHistoryService.getWatchHistory(user, continueWatchingList);

    useWatchHistoryStore.setState({
      watchHistory: watchHistory.filter((item): item is WatchHistoryItem => !!item?.mediaid),
      playlistItemsLoaded: true,
      continueWatchingPlaylistId: continueWatchingList,
    });
  };

  persistWatchHistory = async () => {
    const { watchHistory } = useWatchHistoryStore.getState();
    const { user } = useAccountStore.getState();

    await this.watchHistoryService.persistWatchHistory(watchHistory, user);
  };

  /**
   *  If we already have an element with continue watching state, we:
   *    1. Update the progress
   *    2. Move the element to the continue watching list start
   *  Otherwise:
   *    1. Move the element to the continue watching list start
   *    2. If there are many elements in continue watching state we remove the oldest one
   */
  saveItem = async (item: PlaylistItem, seriesItem: PlaylistItem | undefined, videoProgress: number | null) => {
    const { watchHistory } = useWatchHistoryStore.getState();

    if (!videoProgress) return;

    const updatedHistory = await this.watchHistoryService.saveItem(item, seriesItem, videoProgress, watchHistory);

    if (updatedHistory) {
      useWatchHistoryStore.setState({ watchHistory: updatedHistory });
      await this.persistWatchHistory();
    }
  };
}
