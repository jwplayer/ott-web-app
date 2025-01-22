import { useQuery, type UseBaseQueryResult } from 'react-query';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { isScheduledOrLiveMedia } from '@jwp/ott-common/src/utils/liveEvent';
import { useTranslation } from 'react-i18next';

export type UseMediaResult<TData = PlaylistItem, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function useMedia(mediaId: string, enabled: boolean = true): UseMediaResult {
  const apiService = getModule(ApiService);

  // Determine currently selected language
  const { i18n } = useTranslation();
  const language = i18n.language;

  return useQuery(['media', mediaId, language], () => apiService.getMediaById({ id: mediaId, language }), {
    enabled: !!mediaId && enabled,
    refetchInterval: (data, _) => {
      if (!data) return false;

      const autoRefetch = isScheduledOrLiveMedia(data);

      return autoRefetch ? 1000 * 30 : false;
    },
    staleTime: 60 * 1000 * 10, // 10 min
  });
}
