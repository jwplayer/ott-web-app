import type { Playlist, PlaylistItem } from '../../types/playlist';
import { MediaStore } from '../providers/MediaLoader';
import { AccountStore } from '../stores/AccountStore';
import { deepCopy } from '../utils/collection';

import { signUrl } from './sso.service';

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

  // Anytime we get a playlist, update the cached items
  MediaStore.update((s) => {
    const playlist = data as Playlist;

    if (s.playlists && playlist && playlist.feedid) {
      s.playlists[playlist.feedid] = deepCopy(playlist);
    }

    playlist?.playlist?.forEach((item) => {
      if (s.items) {
        s.items[item.mediaid] = deepCopy(item);
      }
    });
  });

  return data;
};

/**
 * Get playlist by id
 * @param {string} id
 * @param relatedMediaId
 * @param limit
 */
export const getPlaylistById = (id: string, relatedMediaId?: string, limit?: number): Promise<Playlist | undefined> => {
  const url = signUrl(`/v2/playlists/${id}`, { page_limit: limit?.toString(), related_media_id: relatedMediaId });

  return fetch(url).then(getDataOrThrow);
};

/**
 * Get search playlist
 * @param {string} playlistId
 * @param {string} query
 */
export const getSearchPlaylist = (playlistId: string, query: string): Promise<Playlist | undefined> => {
  return fetch(signUrl(`/v2/playlists/${playlistId}`, { search: encodeURIComponent(query) })).then(getDataOrThrow);
};

/**
 * Get media by id
 * @param {string} id
 */
export async function getMediaById(id: string): Promise<PlaylistItem | undefined> {
  const token = AccountStore.getRawState().accessToken || '';

  // If signed in, try to get the media from the delivery api
  if (token) {
    return await fetchMediaById(id);
  }

  // Otherwise return the cached metadata from memory
  return MediaStore.getRawState().items?.[id];
}

export const fetchMediaById = (id: string): Promise<PlaylistItem | undefined> => {
  return fetch(signUrl(`/v2/media/${id}`))
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
