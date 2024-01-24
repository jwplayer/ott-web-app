import { PersonalShelf, PersonalShelves, PLAYLIST_LIMIT } from '@jwp/ott-common/src/constants';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useFavoritesStore } from '@jwp/ott-common/src/stores/FavoritesStore';
import { useWatchHistoryStore } from '@jwp/ott-common/src/stores/WatchHistoryStore';
import { generatePlaylistPlaceholder } from '@jwp/ott-common/src/utils/collection';
import { isTruthyCustomParamValue } from '@jwp/ott-common/src/utils/common';
import { isScheduledOrLiveMedia } from '@jwp/ott-common/src/utils/liveEvent';
import type { Content } from '@jwp/ott-common/types/config';
import type { Playlist } from '@jwp/ott-common/types/playlist';
import { useQueries, useQueryClient } from 'react-query';

const placeholderData = generatePlaylistPlaceholder(30);

type UsePlaylistResult = {
  data: Playlist | undefined;
  isLoading: boolean;
  isSuccess?: boolean;
  error?: unknown;
}[];

const usePlaylists = (content: Content[], rowsToLoad: number | undefined = undefined) => {
  const page_limit = PLAYLIST_LIMIT.toString();
  const queryClient = useQueryClient();
  const apiService = getModule(ApiService);

  const favorites = useFavoritesStore((state) => state.getPlaylist());
  const watchHistory = useWatchHistoryStore((state) => state.getPlaylist());

  const playlistQueries = useQueries(
    content.map(({ contentId, type }, index) => ({
      enabled: !!contentId && (!rowsToLoad || rowsToLoad > index) && !PersonalShelves.some((pType) => pType === type),
      queryKey: ['playlist', contentId],
      queryFn: async () => {
        const playlist = await apiService.getPlaylistById(contentId, { page_limit });

        // This pre-caches all playlist items and makes navigating a lot faster.
        playlist?.playlist?.forEach((playlistItem) => {
          queryClient.setQueryData(['media', playlistItem.mediaid], playlistItem);
        });

        return playlist;
      },
      placeholderData: !!contentId && placeholderData,
      refetchInterval: (data: Playlist | undefined) => {
        if (!data) return false;

        const autoRefetch = isTruthyCustomParamValue(data.refetch) || data.playlist.some(isScheduledOrLiveMedia);

        return autoRefetch ? 1000 * 30 : false;
      },
      retry: false,
    })),
  );

  const result: UsePlaylistResult = content.map(({ type }, index) => {
    if (type === PersonalShelf.Favorites) return { data: favorites, isLoading: false, isSuccess: true };
    if (type === PersonalShelf.ContinueWatching) return { data: watchHistory, isLoading: false, isSuccess: true };

    const { data, isLoading, isSuccess, error } = playlistQueries[index];

    return {
      data,
      isLoading,
      isSuccess,
      error,
    };
  });

  return result;
};

export default usePlaylists;
