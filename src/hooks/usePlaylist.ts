import { UseBaseQueryResult, useQuery } from 'react-query';

import { generatePlaylistPlaceholder } from '../utils/collection';
import { getPlaylistById } from '../services/api.service';

import type { Playlist } from '#types/playlist';

const placeholderData = generatePlaylistPlaceholder(30);

export type UsePlaylistResult<TData = Playlist, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function usePlaylist(
  playlistId: string,
  relatedMediaId?: string,
  enabled: boolean = true,
  usePlaceholderData: boolean = true,
  limit?: number,
): UsePlaylistResult {
  return useQuery(['playlist', playlistId, relatedMediaId], () => getPlaylistById(playlistId, relatedMediaId, limit), {
    enabled: !!playlistId && enabled,
    placeholderData: usePlaceholderData ? placeholderData : undefined,
    retry: false,
  });
}
