import useContentProtection from '#src/hooks/useContentProtection';
import { generatePlaylistPlaceholder } from '#src/utils/collection';
import type { GetPlaylistParams, Playlist } from '#types/playlist';
import { getPlaylistById } from '#src/services/api.service';
import { queryClient } from '#src/providers/QueryProvider';

const placeholderData = generatePlaylistPlaceholder(30);

/**
 * Filter out media item with the given id
 */
const filterMediaItem = (playlist: Playlist | undefined, mediaId?: string) => {
  if (playlist?.playlist && mediaId) {
    playlist.playlist = playlist.playlist.filter((playlistItem) => playlistItem.mediaid !== mediaId);
  }

  return playlist;
};

export default function usePlaylist(playlistId: string, params: GetPlaylistParams = {}, enabled: boolean = true, usePlaceholderData: boolean = true) {
  const callback = async (token?: string, drmPolicyId?: string) => {
    const playlist = await getPlaylistById(playlistId, { token, ...params }, drmPolicyId);

    // This pre-caches all playlist items and makes navigating a lot faster. This doesn't work when DRM is enabled
    // because of the token mechanism.
    playlist?.playlist?.forEach((playlistItem) => {
      queryClient.setQueryData(['media', playlistItem.mediaid, {}, undefined], playlistItem);
    });

    return filterMediaItem(playlist);
  };

  return useContentProtection('playlist', playlistId, callback, params, enabled, usePlaceholderData ? placeholderData : undefined);
}
