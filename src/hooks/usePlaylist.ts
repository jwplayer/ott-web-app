import { UseBaseQueryResult, useQuery } from 'react-query';
import type { Playlist } from 'types/playlist';

import { generatePlaylistPlaceholder } from '../utils/collection';

const baseUrl = 'https://content.jwplatform.com';
const placeholderData = generatePlaylistPlaceholder(30);

const getPlaylistById = (playlistId: string, relatedMediaId?: string) => {
  const relatedQuery = relatedMediaId ? `?related_media_id=${relatedMediaId}` : '';

  return fetch(`${baseUrl}/v2/playlists/${playlistId}${relatedQuery}`).then((res) => res.json());
};

export type UsePlaylistResult<TData = Playlist, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function usePlaylist(playlistId: string, relatedMediaId?: string): UsePlaylistResult {
  return useQuery(['playlist', playlistId, relatedMediaId], () => getPlaylistById(playlistId, relatedMediaId), {
    enabled: !!playlistId && playlistId !== 'continue-watching',
    placeholderData,
  });
}
