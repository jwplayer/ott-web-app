import { inject, injectable, LazyServiceIdentifer, optional } from 'inversify';

import { useAccountStore } from '#src/stores/AccountStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import type { PlaylistItem } from '#types/playlist';
import type { SerializedWatchHistoryItem, WatchHistoryItem } from '#types/watchHistory';
import type WatchHistoryService from '#src/services/watchHistory/watchhistory.service';
import { SERVICES } from '#src/ioc/types';
import type AccountService from '#src/services/account/account.service';
import type { Customer } from '#types/account';

@injectable()
export default class WatchHistoryController {
  private watchHistoryService: WatchHistoryService;
  private accountService!: AccountService;

  constructor(
    @inject(SERVICES.WatchHistory) watchHistoryService: WatchHistoryService,
    @inject(new LazyServiceIdentifer(() => SERVICES.Account)) @optional() accountService: AccountService,
  ) {
    this.watchHistoryService = watchHistoryService;
    this.accountService = accountService;
  }

  serializeWatchHistory = (watchHistory: WatchHistoryItem[]): SerializedWatchHistoryItem[] => {
    return this.watchHistoryService.serializeWatchHistory(watchHistory);
  };

  private updateUserWatchHistory(watchHistory: WatchHistoryItem[]) {
    useAccountStore.setState((state) => ({
      ...state,
      user: { ...(state.user as Customer), externalData: { ...state.user?.externalData, history: this.serializeWatchHistory(watchHistory) } },
    }));
  }

  async restoreWatchHistory() {
    const { user } = useAccountStore.getState();
    const continueWatchingList = useConfigStore.getState().config.features?.continueWatchingList;

    if (!continueWatchingList) {
      return;
    }

    const watchHistory = await this.watchHistoryService.getWatchHistory(user, continueWatchingList);

    if (watchHistory?.length) {
      useWatchHistoryStore.setState({
        watchHistory: watchHistory.filter((item): item is WatchHistoryItem => !!item?.mediaid),
        playlistItemsLoaded: true,
        continueWatchingPlaylistId: continueWatchingList,
      });
    }
  }

  async persistWatchHistory() {
    const { watchHistory } = useWatchHistoryStore.getState();
    const { user } = useAccountStore.getState();
    const { getSandbox } = useConfigStore.getState();

    if (user?.id && user?.externalData) {
      return this.accountService.updatePersonalShelves({ id: user.id, externalData: user.externalData }, getSandbox());
    }

    this.watchHistoryService.persistWatchHistory(watchHistory);
  }

  /**
   *  If we already have an element with continue watching state, we:
   *    1. Update the progress
   *    2. Move the element to the continue watching list start
   *  Otherwise:
   *    1. Move the element to the continue watching list start
   *    2. If there are many elements in continue watching state we remove the oldest one
   */
  async saveItem(item: PlaylistItem, seriesItem: PlaylistItem | undefined, videoProgress: number | null) {
    const { watchHistory } = useWatchHistoryStore.getState();

    if (!videoProgress) return;

    const updatedHistory = await this.watchHistoryService.saveItem(item, seriesItem, videoProgress, watchHistory);

    if (updatedHistory) {
      useWatchHistoryStore.setState({ watchHistory: updatedHistory });
      this.updateUserWatchHistory(updatedHistory);
      await this.persistWatchHistory();
    }
  }
}
