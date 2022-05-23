import { addQueryParams } from '../utils/formatting';
import type { Playlist, PlaylistItem, PlaylistParams } from '../../types/playlist';
import { API_BASE_URL } from '../config';

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
 */
export const getPlaylistById = (id: string, params: PlaylistParams = {}): Promise<Playlist | undefined> => {
  const url = addQueryParams(`${API_BASE_URL}/v2/playlists/${id}`, params);

  return fetch(url).then(getDataOrThrow);
};

/**
 * Get DRM playlist by id
 */
export const getDRMPlaylistById = async (id: string, policyId: string, params: PlaylistParams = {}): Promise<Playlist | undefined> => {
  const url = addQueryParams(`${API_BASE_URL}/v2/playlists/${id}/drm/${policyId}`, params);

  return fetch(url).then(getDataOrThrow);
};

/**
 * Get media by id
 * @param {string} id
 * @param {string} [token]
 */
export const getMediaById = (id: string, token?: string): Promise<PlaylistItem | undefined> => {
  const url = addQueryParams(`${API_BASE_URL}/v2/media/${id}`, {
    token,
  });

  return fetch(url)
    .then((res) => getDataOrThrow(res) as Promise<Playlist>)
    .then((data) => data.playlist[0]);
};

/**
 * Get media by id
 * @param {string} id
 * @param {string} policyId
 * @param {string} token
 */
export const getDRMMediaById = (id: string, policyId: string, token: string): Promise<PlaylistItem | undefined> => {
  const url = addQueryParams(`${API_BASE_URL}/v2/media/${id}/drm/${policyId}`, {
    token,
  });

  return fetch(url)
    .then((res) => getDataOrThrow(res) as Promise<Playlist>)
    .then((data) => data.playlist[0]);
};

/**
 * Gets multiple media items by the given ids. Filters out items that don't exist.
 * @param {string[]} ids
 */
export const getMediaByIds = async (ids: string[]): Promise<PlaylistItem[]> => {
  // @todo this should be updated when it will become possible to request multiple media items in a single request
  const responses = await Promise.all(ids.map((id) => getMediaById(id)));

  function notEmpty<Value>(value: Value | null | undefined): value is Value {
    return value !== null && value !== undefined;
  }

  return responses.filter(notEmpty);
};
