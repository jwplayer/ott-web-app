import { useQuery } from 'react-query';

import useSignedUrl from '#src/hooks/useSignedUrl';
import { getPlaylistById } from '#src/services/api.service';
import { generatePlaylistPlaceholder } from '#src/utils/collection';
import type { Playlist, PlaylistParams } from '#types/playlist';

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

export default function usePlaylist(playlistId: string, params: PlaylistParams = {}, enabled: boolean = true, usePlaceholderData: boolean = true) {
  const { token, signingEnabled, drmEnabled, drmPolicyId, isLoading } = useSignedUrl('playlist', playlistId, params, enabled);

  const queryResult = useQuery(
    ['playlist', playlistId, params, token],
    async () => {
      const playlist = await getPlaylistById(playlistId, { ...params, token }, drmEnabled ? drmPolicyId : undefined);

      return filterMediaItem(playlist, params.related_media_id);
    },
    {
      enabled: !!playlistId && enabled && (!signingEnabled || !!token),
      placeholderData: usePlaceholderData ? placeholderData : undefined,
      retry: false,
    },
  );

  return {
    ...queryResult,
    isLoading: isLoading || queryResult.isLoading,
  };
}
