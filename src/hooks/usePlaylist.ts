import useContentProtection from '#src/hooks/useContentProtection';
import { generatePlaylistPlaceholder } from '#src/utils/collection';
import type { GetPlaylistParams, Playlist } from '#types/playlist';
import { getPlaylistById } from '#src/services/api.service';

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

export default function usePlaylist (playlistId: string, params: GetPlaylistParams = {}, enabled: boolean = true, usePlaceholderData: boolean = true) {
  const callback = async (token?: string, drmPolicyId?: string) => {
    const playlist = await getPlaylistById(playlistId, { token, ...params }, drmPolicyId);

    return filterMediaItem(playlist);
  }

  return useContentProtection('playlist', playlistId, callback, params, enabled, usePlaceholderData ? placeholderData : undefined);
}
