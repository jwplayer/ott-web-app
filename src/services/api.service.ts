import { addQueryParams } from '../utils/formatting';
import type { Playlist, PlaylistItem } from '../../types/playlist';
import { API_BASE_URL } from '../config';

import { filterMediaOffers } from '#src/utils/entitlements';

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
 * Transform incoming media items
 * - Parses productId into MediaOffer[] for all cleeng offers
 *
 * @param item
 */
export const transformMediaItem = (item: PlaylistItem) => {
  return {
    ...item,
    mediaOffers: item.productIds ? filterMediaOffers('cleeng', item.productIds) : undefined,
  };
};

/**
 * Transform incoming playlists
 *
 * @param playlist
 * @param relatedMediaId
 */
export const transformPlaylist = (playlist: Playlist, relatedMediaId?: string) => {
  playlist.playlist = playlist.playlist.map(transformMediaItem);

  if (relatedMediaId) playlist.playlist.filter((item) => item.mediaid !== relatedMediaId);

  return playlist;
};

/**
 * Get playlist by id
 * @param {string} id
 * @param relatedMediaId
 */
export const getPlaylistById = async (id?: string, relatedMediaId?: string, limit?: number): Promise<Playlist | undefined> => {
  if (!id) {
    return undefined;
  }

  const url = addQueryParams(`${API_BASE_URL}/v2/playlists/${id}`, {
    related_media_id: relatedMediaId,
    page_limit: limit?.toString(),
  });

  const response = await fetch(url);
  const data = await getDataOrThrow(response);

  return transformPlaylist(data, relatedMediaId);
};

/**
 * Get search playlist
 * @param {string} playlistId
 * @param {string} query
 */
export const getSearchPlaylist = async (playlistId: string, query: string): Promise<Playlist | undefined> => {
  const response = await fetch(`${API_BASE_URL}/v2/playlists/${playlistId}?search=${encodeURIComponent(query)}`);
  const data = await getDataOrThrow(response);

  return transformPlaylist(data);
};

/**
 * Get media by id
 * @param {string} id
 */
export const getMediaById = async (id: string): Promise<PlaylistItem | undefined> => {
  const response = await fetch(`${API_BASE_URL}/v2/media/${id}`);
  const data = (await getDataOrThrow(response)) as Playlist;
  const mediaItem = data.playlist[0];

  if (!mediaItem) throw new Error('MediaItem not found');

  return transformMediaItem(mediaItem);
};

/**
 * Gets multiple media items by the given ids. Filters out items that don't exist.
 * @param {string[]} ids
 */
export const getMediaByIds = async (ids: string[]): Promise<PlaylistItem[]> => {
  // @todo this should be updated when it will become possible to request multiple media items in a single request
  const responses = await Promise.allSettled(ids.map((id) => getMediaById(id)));

  function notEmpty<Value>(value: Value | null | undefined): value is Value {
    return value !== null && value !== undefined;
  }

  return responses.map((result) => (result.status === 'fulfilled' ? result.value : null)).filter(notEmpty);
};
