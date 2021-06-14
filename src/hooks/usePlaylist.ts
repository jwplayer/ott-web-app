import { UseBaseQueryResult, useQuery } from 'react-query';
import type { Playlist } from 'types/playlist';

import { generatePlaylistPlaceholder } from '../utils/collection';
import { getPlaylistById } from '../services/api.service';

const placeholderData = generatePlaylistPlaceholder(30);

export type UsePlaylistResult<TData = Playlist, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function usePlaylist(playlistId: string, relatedMediaId?: string): UsePlaylistResult {
  return useQuery(['playlist', playlistId, relatedMediaId], () => getPlaylistById(playlistId, relatedMediaId), {
    enabled: !!playlistId,
    placeholderData,
  });
}
