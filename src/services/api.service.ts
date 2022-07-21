import { addQueryParams } from '../utils/formatting';
import { getDataOrThrow } from '../utils/api';

import { filterMediaOffers } from '#src/utils/entitlements';
import type { GetPlaylistParams, Playlist, PlaylistItem } from '#types/playlist';
import type { Series, GetSeriesParams } from '#types/series';

/**
 * Transform incoming media items
 * - Parses productId into MediaOffer[] for all cleeng offers
 *
 * @param item
 */
export const transformMediaItem = (item: PlaylistItem) => ({
  ...item,
  mediaOffers: item.productIds ? filterMediaOffers('cleeng', item.productIds) : undefined,
});

/**
 * Transform incoming playlists
 *
 * @param playlist
 * @param relatedMediaId
 */
export const transformPlaylist = (playlist: Playlist, relatedMediaId?: string) => {
  playlist.playlist = playlist.playlist.map(transformMediaItem);

  // remove the related media item (when this is a recommendations playlist)
  if (relatedMediaId) playlist.playlist.filter((item) => item.mediaid !== relatedMediaId);

  return playlist;
};

/**
 * Get playlist by id
 * @param {string} id
 * @param params
 * @param {string} [drmPolicyId]
 */
export const getPlaylistById = async (id?: string, params: GetPlaylistParams = {}, drmPolicyId?: string): Promise<Playlist | undefined> => {
  if (!id) {
    return undefined;
  }

  const pathname = drmPolicyId ? `/v2/playlists/${id}/drm/${drmPolicyId}` : `/v2/playlists/${id}`;
  const url = addQueryParams(`${import.meta.env.APP_API_BASE_URL}${pathname}`, params);
  const response = await fetch(url);
  const data = await getDataOrThrow(response);

  return transformPlaylist(data, params.related_media_id);
};

/**
 * Get watchlist by playlistId
 * @param {string} playlistId
 * @param {string} [token]
 * @param {string} [drmPolicyId]
 */
export const getMediaByWatchlist = async (playlistId: string, mediaIds: string[], token?: string): Promise<PlaylistItem[] | undefined> => {
  if (!mediaIds?.length) {
    return [];
  }

  const pathname = `/apps/watchlists/${playlistId}`;
  const url = addQueryParams(`${import.meta.env.APP_API_BASE_URL}${pathname}`, { token, media_ids: mediaIds });
  const response = await fetch(url);
  const data = (await getDataOrThrow(response)) as Playlist;

  if (!data) throw new Error(`The data was not found using the watchlist ${playlistId}`);

  return (data.playlist || []).map(transformMediaItem);
};

/**
 * Get media by id
 * @param {string} id
 * @param {string} [token]
 * @param {string} [drmPolicyId]
 */
export const getMediaById = async (id: string, token?: string, drmPolicyId?: string): Promise<PlaylistItem | undefined> => {
  const pathname = drmPolicyId ? `/v2/media/${id}/drm/${drmPolicyId}` : `/v2/media/${id}`;
  const url = addQueryParams(`${import.meta.env.APP_API_BASE_URL}${pathname}`, { token });
  const response = await fetch(url);
  const data = (await getDataOrThrow(response)) as Playlist;
  const mediaItem = data.playlist[0];

  if (!mediaItem) throw new Error('MediaItem not found');

  return transformMediaItem(mediaItem);
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

/**
 * Get series by id
 * @param {string} id
 * @param params
 */
export const getSeries = async (id: string, params: GetSeriesParams = {}): Promise<Series | undefined> => {
  if (!id) {
    throw new Error('Series ID is required');
  }

  const pathname = `/apps/series/${id}`;
  const url = addQueryParams(`${import.meta.env.APP_API_BASE_URL}${pathname}`, params);
  const response = await fetch(url);
  const data = await getDataOrThrow(response);

  return data;
};
