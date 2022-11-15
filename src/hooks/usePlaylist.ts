import useContentProtection from '#src/hooks/useContentProtection';
import { generatePlaylistPlaceholder } from '#src/utils/collection';
import type { GetPlaylistParams } from '#types/playlist';
import { getPlaylistById } from '#src/services/api.service';
import { queryClient } from '#src/containers/QueryProvider/QueryProvider';

const placeholderData = generatePlaylistPlaceholder(30);

export default function usePlaylist(playlistId?: string, params: GetPlaylistParams = {}, enabled: boolean = true, usePlaceholderData: boolean = true) {
  const callback = async (token?: string, drmPolicyId?: string) => {
    const playlist = await getPlaylistById(playlistId, { token, ...params }, drmPolicyId);

    // This pre-caches all playlist items and makes navigating a lot faster. This doesn't work when DRM is enabled
    // because of the token mechanism.
    playlist?.playlist?.forEach((playlistItem) => {
      queryClient.setQueryData(['media', playlistItem.mediaid, {}, undefined], playlistItem);
    });

    return playlist;
  };

  return useContentProtection('playlist', playlistId, callback, params, enabled, usePlaceholderData ? placeholderData : undefined);
}
