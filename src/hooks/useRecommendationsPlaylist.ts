import { UseBaseQueryResult, useQuery } from 'react-query';
import type { Playlist, PlaylistItem } from 'types/playlist';

import { getPlaylistById } from '../services/api.service';

export type UseRecommendationsPlaylistResult<TData = Playlist, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function useRecommendedPlaylist(playlistId: string, relatedItem?: PlaylistItem, enabled: boolean = true): UseRecommendationsPlaylistResult {
  return useQuery(
    ['recommendationsPlaylist', playlistId, relatedItem?.mediaid],
    () =>
      getPlaylistById(playlistId, relatedItem?.mediaid).then((playlist) => {
        if (playlist?.playlist && relatedItem) {
          playlist.playlist = playlist.playlist.filter((item) => item.mediaid !== relatedItem.mediaid);
        }

        return playlist;
      }),
    {
      enabled: !!playlistId && !!relatedItem && enabled,
      retry: false,
    },
  );
}
