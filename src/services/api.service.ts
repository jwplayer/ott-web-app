import { addQueryParams } from '../utils/formatting';
import { API_BASE_URL } from '../config';

import type { GetPlaylistParams, Playlist, PlaylistItem } from '#types/playlist';

/**
 * Get data
 * @param response
 */
export const getDataOrThrow = async (response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    const message = `Request '${response.url}' failed with ${response.status}`;

    throw new Error(data?.message || message);
  }

  return data;
};

/**
 * Get playlist by id
 * @param {string} id
 * @param params
 * @param {string} [drmPolicyId]
 */
export const getPlaylistById = (id: string, params: GetPlaylistParams = {}, drmPolicyId?: string): Promise<Playlist | undefined> => {
  const pathname = drmPolicyId ? `/v2/playlists/${id}/drm/${drmPolicyId}` : `/v2/playlists/${id}`;
  const url = addQueryParams(`${API_BASE_URL}${pathname}`, params);

  return fetch(url).then(getDataOrThrow);
};

/**
 * Get media by id
 * @param {string} id
 * @param {string} [token]
 * @param {string} [drmPolicyId]
 */
export const getMediaById = (id: string, token?: string, drmPolicyId?: string): Promise<PlaylistItem | undefined> => {
  const pathname = drmPolicyId ? `/v2/media/${id}/drm/${drmPolicyId}` : `/v2/media/${id}`;
  const url = addQueryParams(`${API_BASE_URL}${pathname}`, {
    token,
  });

  return fetch(url)
    .then((res) => getDataOrThrow(res) as Promise<Playlist>)
    .then((data) => data.playlist[0]);
};

/**
 * Gets multiple media items by the given ids. Filters out items that don't exist.
 * @param {string[]} ids
 * @param {Object} tokens
 * @param {string} drmPolicyId
 */
export const getMediaByIds = async (ids: string[], tokens?: Record<string, string>, drmPolicyId?: string): Promise<PlaylistItem[]> => {
  // @todo this should be updated when it will become possible to request multiple media items in a single request
  const responses = await Promise.allSettled(ids.map((id) => getMediaById(id, tokens?.[id], drmPolicyId)));

  function notEmpty<Value>(value: Value | null | undefined): value is Value {
    return value !== null && value !== undefined;
  }

  return responses.map((result) => (result.status === 'fulfilled' ? result.value : null)).filter(notEmpty);
};
