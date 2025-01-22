import { QueryClient, useQuery, useQueryClient } from 'react-query';
import type { GetPlaylistParams, Playlist } from '@jwp/ott-common/types/playlist';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { generatePlaylistPlaceholder } from '@jwp/ott-common/src/utils/collection';
import { isScheduledOrLiveMedia } from '@jwp/ott-common/src/utils/liveEvent';
import { isTruthyCustomParamValue } from '@jwp/ott-common/src/utils/common';
import type { ApiError } from '@jwp/ott-common/src/utils/api';
import type { AppMenuType } from '@jwp/ott-common/types/config';
import { APP_CONFIG_ITEM_TYPE } from '@jwp/ott-common/src/constants';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useTranslation } from 'react-i18next';

const placeholderData = generatePlaylistPlaceholder(30);

export const getPlaylistQueryOptions = ({
  type,
  contentId,
  siteId,
  enabled,
  usePlaceholderData,
  params = {},
  queryClient,
  language,
}: {
  type: AppMenuType;
  contentId: string | undefined;
  siteId: string;
  enabled: boolean;
  queryClient: QueryClient;
  usePlaceholderData?: boolean;
  params?: GetPlaylistParams;
  language: string;
}) => {
  const apiService = getModule(ApiService);

  return {
    enabled: !!contentId && enabled,
    queryKey: ['playlist', type, contentId, params, language],
    queryFn: async () => {
      if (type === APP_CONFIG_ITEM_TYPE.playlist) {
        const playlist = await apiService.getPlaylistById(contentId, params, language);

        // This pre-caches all playlist items and makes navigating a lot faster.
        playlist?.playlist?.forEach((playlistItem) => {
          queryClient.setQueryData(['media', playlistItem.mediaid], playlistItem);
        });

        return playlist;
      } else if (type === APP_CONFIG_ITEM_TYPE.content_list) {
        const contentList = await apiService.getContentList({ siteId, id: contentId, language });

        return contentList;
      }
    },
    placeholderData: contentId && usePlaceholderData ? placeholderData : undefined,
    refetchInterval: (data: Playlist | undefined) => {
      if (!data) return false;

      const autoRefetch = isTruthyCustomParamValue(data.refetch) || data.playlist.some(isScheduledOrLiveMedia);

      return autoRefetch ? 1000 * 30 : false;
    },
    retry: false,
  };
};

export default function usePlaylist(
  contentId?: string,
  params: GetPlaylistParams = {},
  enabled: boolean = true,
  usePlaceholderData: boolean = true,
  type: AppMenuType = APP_CONFIG_ITEM_TYPE.playlist,
) {
  // Determine currently selected language
  const { i18n } = useTranslation();
  const language = i18n.language;

  const queryClient = useQueryClient();
  const siteId = useConfigStore((state) => state.config.siteId);

  const queryOptions = getPlaylistQueryOptions({ type, contentId, siteId, params, queryClient, enabled, usePlaceholderData, language });

  return useQuery<Playlist | undefined, ApiError>(queryOptions);
}
