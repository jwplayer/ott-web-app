import { useQuery } from 'react-query';
import type { GetPlaylistParams, Playlist } from '@jwplayer/ott-common/types/playlist';
import ApiService from '@jwplayer/ott-common/src/services/api.service';
import { getModule } from '@jwplayer/ott-common/src/modules/container';
import { generatePlaylistPlaceholder } from '@jwplayer/ott-common/src/utils/collection';
import { isScheduledOrLiveMedia } from '@jwplayer/ott-common/src/utils/liveEvent';
import { isTruthyCustomParamValue } from '@jwplayer/ott-common/src/utils/common';
import type { ApiError } from '@jwplayer/ott-common/src/utils/api';
import { queryClient } from '@jwplayer/ott-common/src/queryClient';

const placeholderData = generatePlaylistPlaceholder(30);

export default function usePlaylist(playlistId?: string, params: GetPlaylistParams = {}, enabled: boolean = true, usePlaceholderData: boolean = true) {
  const apiService = getModule(ApiService);

  const callback = async (playlistId?: string, params?: GetPlaylistParams) => {
    const playlist = await apiService.getPlaylistById(playlistId, { ...params });

    // This pre-caches all playlist items and makes navigating a lot faster.
    playlist?.playlist?.forEach((playlistItem) => {
      queryClient.setQueryData(['media', playlistItem.mediaid], playlistItem);
    });

    return playlist;
  };

  const queryKey = ['playlist', playlistId, params];
  const isEnabled = !!playlistId && enabled;

  return useQuery<Playlist | undefined, ApiError>(queryKey, () => callback(playlistId, params), {
    enabled: isEnabled,
    placeholderData: usePlaceholderData && isEnabled ? placeholderData : undefined,
    refetchInterval: (data, _) => {
      if (!data) return false;

      const autoRefetch = isTruthyCustomParamValue(data.refetch) || data.playlist.some(isScheduledOrLiveMedia);

      return autoRefetch ? 1000 * 30 : false;
    },
    retry: false,
  });
}
