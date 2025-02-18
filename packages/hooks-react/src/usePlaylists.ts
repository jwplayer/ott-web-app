import { PersonalShelf, PersonalShelves, PLAYLIST_LIMIT } from '@jwp/ott-common/src/constants';
import { useFavoritesStore } from '@jwp/ott-common/src/stores/FavoritesStore';
import { useWatchHistoryStore } from '@jwp/ott-common/src/stores/WatchHistoryStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import type { Content, AppContentType, AppMenuType } from '@jwp/ott-common/types/config';
import type { Playlist } from '@jwp/ott-common/types/playlist';
import { useQueries, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';

import { getPlaylistQueryOptions } from './usePlaylist';

type UsePlaylistResult = {
  data: Playlist | undefined;
  isSuccess?: boolean;
  error?: unknown;
  isPlaceholderData?: boolean;
}[];

const isPlaylistType = (type: AppContentType): type is AppMenuType => !PersonalShelves.some((pType) => pType === type);

const usePlaylists = (content: Content[], rowsToLoad: number | undefined = undefined, pageLimit: number | undefined = PLAYLIST_LIMIT) => {
  const queryClient = useQueryClient();

  const siteId = useConfigStore((state) => state.config.siteId);
  const favorites = useFavoritesStore((state) => state.getPlaylist());
  const watchHistory = useWatchHistoryStore((state) => state.getPlaylist());

  // Determine currently selected language
  const { i18n } = useTranslation();

  const playlistQueries = useQueries(
    content.map(({ contentId, type }, index) => {
      if (isPlaylistType(type)) {
        return getPlaylistQueryOptions({
          enabled: !rowsToLoad || rowsToLoad > index,
          type,
          siteId,
          contentId,
          queryClient,
          usePlaceholderData: true,
          params: { page_limit: pageLimit },
          language: i18n.language,
        });
      }

      return { enabled: false };
    }),
  );

  const result: UsePlaylistResult = content.map(({ type }, index) => {
    if (type === PersonalShelf.Favorites) return { data: favorites, isLoading: false, isSuccess: true };
    if (type === PersonalShelf.ContinueWatching) return { data: watchHistory, isLoading: false, isSuccess: true };

    const { data, isSuccess, error, isPlaceholderData } = playlistQueries[index];

    return {
      data,
      isSuccess,
      error,
      isPlaceholderData,
    };
  });

  return result;
};

export default usePlaylists;
