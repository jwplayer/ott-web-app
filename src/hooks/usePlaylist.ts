import { useQuery } from 'react-query';

import { generatePlaylistPlaceholder } from '#src/utils/collection';
import type { GetPlaylistParams } from '#types/playlist';
import { getPlaylistById } from '#src/services/api.service';
import { queryClient } from '#src/containers/QueryProvider/QueryProvider';
import { isScheduledOrLiveMedia } from '#src/utils/liveEvent';

const placeholderData = generatePlaylistPlaceholder(30);

export default function usePlaylist(playlistId?: string, params: GetPlaylistParams = {}, enabled: boolean = true, usePlaceholderData: boolean = true) {
  const callback = async (playlistId?: string, params?: GetPlaylistParams) => {
    const playlist = await getPlaylistById(playlistId, { ...params });

    // This pre-caches all playlist items and makes navigating a lot faster.
    playlist?.playlist?.forEach((playlistItem) => {
      queryClient.setQueryData(['media', playlistItem.mediaid], playlistItem);
    });

    return playlist;
  };

  const queryKey = ['playlist', playlistId, params];
  const isEnabled = !!playlistId && enabled;

  return useQuery(queryKey, () => callback(playlistId, params), {
    enabled: isEnabled,
    placeholderData: usePlaceholderData && isEnabled ? placeholderData : undefined,
    refetchInterval: (data, _) => {
      if (!data) return false;

      let shouldRefetchPlaylist = data.refetch;

      for (const media of data.playlist) {
        if (shouldRefetchPlaylist) break;

        shouldRefetchPlaylist = isScheduledOrLiveMedia(media);
      }

      return shouldRefetchPlaylist ? 1000 * 30 : false;
    },
    retry: false,
  });
}
