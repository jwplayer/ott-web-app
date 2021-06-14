import { Store } from 'pullstate';

type WatchHistoryItem = {
  mediaId: string;
};

type WatchHistoryStore = {
  watchHistory: WatchHistoryItem[];
};

export const WatchHistoryStore = new Store<WatchHistoryStore>({
  watchHistory: [{ mediaId: '' }],
});
