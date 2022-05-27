import { UseBaseQueryResult, useQuery } from 'react-query';

import { getPlaylistById } from '../services/api.service';

import type { Playlist, PlaylistItem } from '#types/playlist';

export type UseRecommendationsPlaylistResult<TData = Playlist, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function useRecommendedPlaylist(playlistId: string, relatedItem?: PlaylistItem, enabled: boolean = true): UseRecommendationsPlaylistResult {
  return useQuery(['recommendationsPlaylist', playlistId, relatedItem?.mediaid], () => getPlaylistById(playlistId, relatedItem?.mediaid), {
    enabled: !!playlistId && !!relatedItem && enabled,
    retry: false,
  });
}
