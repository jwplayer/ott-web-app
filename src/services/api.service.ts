import type { Playlist, PlaylistItem } from '../../types/playlist';
import { API_BASE_URL } from '../config';

/**
 * Get playlist by id
 * @param {string} id
 * @param relatedMediaId
 */
export const getPlaylistById = (id: string, relatedMediaId?: string) : Promise<Playlist | undefined> => {
  const relatedQuery = relatedMediaId ? `?related_media_id=${relatedMediaId}` : '';

  return fetch(`${API_BASE_URL}/v2/playlists/${id}${relatedQuery}`)
    .then((res) => res.json());
};

/**
 * Get search playlist
 * @param {string} playlistId
 * @param {string} query
 */
export const getSearchPlaylist = (playlistId: string, query: string) : Promise<Playlist | undefined> => {
  return fetch(`${API_BASE_URL}/v2/playlists/${playlistId}?search=${encodeURIComponent(query)}`)
    .then((res) => res.json());
};

/**
 * Get media by id
 * @param {string} id
 */
export const getMediaById = (id: string): Promise<PlaylistItem | undefined> => {
  return fetch(`${API_BASE_URL}/v2/media/${id}`)
    .then((res) => res.json() as Promise<Playlist>)
    .then(data => data.playlist[0]);
};

/**
 * Gets multiple media items by the given ids. Filters out items that don't exist.
 * @param {string[]} ids
 */
export const getMediaByIds = async (ids: string[]): Promise<PlaylistItem[]> => {
  // @todo this should be updated when it will become possible to request multiple media items in a single request
  const responses = await Promise.all(ids.map(id => getMediaById(id)));

  function notEmpty<Value> (value: Value | null | undefined): value is Value {
    return value !== null && value !== undefined;
  }

  return responses.filter(notEmpty);
}
