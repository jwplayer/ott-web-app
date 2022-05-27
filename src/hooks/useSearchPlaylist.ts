import { UseBaseQueryResult, useQuery } from 'react-query';

import { generatePlaylistPlaceholder } from '../utils/collection';
import { getSearchPlaylist } from '../services/api.service';

import type { Playlist } from '#types/playlist';

const placeholderData = generatePlaylistPlaceholder();

export type UseSearchPlaylistResult<TData = Playlist, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function useSearchPlaylist(playlistId: string, query: string, usePlaceholderData: boolean = true): UseSearchPlaylistResult {
  return useQuery(['playlist', playlistId, query], () => getSearchPlaylist(playlistId, query), {
    enabled: !!playlistId && !!query,
    placeholderData: usePlaceholderData ? placeholderData : undefined,
    keepPreviousData: true,
  });
}
