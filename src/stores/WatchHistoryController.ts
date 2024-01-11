import { inject, injectable } from 'inversify';

import { useAccountStore } from '#src/stores/AccountStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import WatchHistoryService from '#src/services/watchhistory.service';
import AccountService from '#src/services/account.service';
import type { PlaylistItem } from '#types/playlist';
import type { SerializedWatchHistoryItem, WatchHistoryItem } from '#types/watchHistory';
import type { Customer } from '#types/account';
import { getNamedModule } from '#src/modules/container';
import type { IntegrationType } from '#types/Config';

@injectable()
export default class WatchHistoryController {
  private readonly watchHistoryService: WatchHistoryService;
  private readonly accountService?: AccountService;

  constructor(@inject('INTEGRATION_TYPE') integrationType: IntegrationType, watchHistoryService: WatchHistoryService) {
    this.watchHistoryService = watchHistoryService;
    this.accountService = getNamedModule(AccountService, integrationType, false);
  }

  serializeWatchHistory = (watchHistory: WatchHistoryItem[]): SerializedWatchHistoryItem[] => {
    return this.watchHistoryService.serializeWatchHistory(watchHistory);
  };

  private updateUserWatchHistory(watchHistory: WatchHistoryItem[]) {
    const { user } = useAccountStore.getState();

    if (user) {
      useAccountStore.setState((state) => ({
        ...state,
        user: {
          ...(state.user as Customer),
          externalData: { ...state.user?.externalData, history: this.serializeWatchHistory(watchHistory) },
        },
      }));
    }
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

    if (watchHistory?.length) {
      useWatchHistoryStore.setState({
        watchHistory: watchHistory.filter((item): item is WatchHistoryItem => !!item?.mediaid),
        playlistItemsLoaded: true,
        continueWatchingPlaylistId: continueWatchingList,
      });
    }
  };

  persistWatchHistory = async () => {
    const { watchHistory } = useWatchHistoryStore.getState();
    const { user } = useAccountStore.getState();
    const { isSandbox } = useConfigStore.getState();

    if (user?.id && user?.externalData) {
      return this.accountService?.updatePersonalShelves({ id: user.id, externalData: user.externalData }, isSandbox);
    }

    this.watchHistoryService.persistWatchHistory(watchHistory);
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
      this.updateUserWatchHistory(updatedHistory);
      await this.persistWatchHistory();
    }
  };
}
