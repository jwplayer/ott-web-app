import { UseBaseQueryResult, useQuery } from 'react-query';
import type { Playlist } from 'types/playlist';

const baseUrl = 'https://content.jwplatform.com'; // temp data, till config arrives

const getPlaylistById = (playlistId: string) => {
  return fetch(`${baseUrl}/v2/playlists/${playlistId}`).then((res) => res.json());
};

export type UsePlaylistResult<TData = Playlist, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function usePlaylist(playlistId: string): UsePlaylistResult {
  return useQuery(['playlist', playlistId], () => getPlaylistById(playlistId), { enabled: !!playlistId });
}
