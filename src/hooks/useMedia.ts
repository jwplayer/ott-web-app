import { UseBaseQueryResult, useQuery } from 'react-query';
import type { Media } from 'types/media';

const baseUrl = 'https://content.jwplatform.com'; // temp data, till config arrives

const getMediaById = (mediaId: string, recommendations_playlist_id?: string) => {
  const recommendationQuery = recommendations_playlist_id
    ? `?recommendations_playlist_id=${recommendations_playlist_id}`
    : '';

  return fetch(`${baseUrl}/v2/media/${mediaId}${recommendationQuery}`).then((res) => res.json());
};

export type UseMediaResult<TData = Media, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function useMedia(mediaId: string, recommendations_playlist_id?: string): UseMediaResult {
  return useQuery(['media', mediaId], () => getMediaById(mediaId, recommendations_playlist_id), {
    enabled: !!mediaId,
  });
}
