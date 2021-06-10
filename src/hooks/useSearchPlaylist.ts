import { UseBaseQueryResult, useQuery } from 'react-query';
import type { Playlist } from 'types/playlist';

import { generatePlaylistPlaceholder } from '../utils/collection';

const baseUrl = 'https://content.jwplatform.com';
const placeholderData = generatePlaylistPlaceholder();

const getSearchPlaylist = (playlistId: string, query: string) => {
  return fetch(`${baseUrl}/v2/playlists/${playlistId}?search=${encodeURIComponent(query)}`).then((res) => res.json());
};

export type UseSearchPlaylistResult<TData = Playlist, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function useSearchPlaylist(playlistId: string, query: string, usePlaceholderData: boolean = true): UseSearchPlaylistResult {
  return useQuery(['playlist', playlistId, query], () => {
    return getSearchPlaylist(playlistId, query)
  }, {
    enabled: !!playlistId && !!query,
    placeholderData: usePlaceholderData ? placeholderData : undefined,
    keepPreviousData: true,
  });
}
