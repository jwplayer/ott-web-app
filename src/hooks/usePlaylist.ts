import { UseBaseQueryResult, useQuery } from 'react-query';
import type { Playlist, PlaylistItem } from 'types/playlist';

const baseUrl = 'https://content.jwplatform.com';

const placeholderData: Playlist = {
  title: '',
  playlist: new Array(30).fill({
    description: '',
    duration: 0,
    feedid: '',
    image: '',
    images: [],
    link: '',
    genre: '',
    mediaid: '',
    pubdate: 0,
    rating: '',
    sources: [],
    tags: '',
    title: '',
    tracks: [],
  } as PlaylistItem),
};

const getPlaylistById = (playlistId: string, relatedMediaId?: string) => {
  const relatedQuery = relatedMediaId ? `?related_media_id=${relatedMediaId}` : '';

  return fetch(`${baseUrl}/v2/playlists/${playlistId}${relatedQuery}`).then((res) => res.json());
};

export type UsePlaylistResult<TData = Playlist, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function usePlaylist(playlistId: string, relatedMediaId?: string): UsePlaylistResult {
  return useQuery(['playlist', playlistId, relatedMediaId], () => getPlaylistById(playlistId, relatedMediaId), {
    enabled: !!playlistId,
    placeholderData,
  });
}
