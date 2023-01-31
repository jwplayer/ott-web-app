import { addQueryParams } from '#src/utils/formatting';
import { getDataOrThrow } from '#src/utils/api';
import { filterMediaOffers } from '#src/utils/entitlements';
import type { GetPlaylistParams, Playlist, PlaylistItem } from '#types/playlist';
import type { AdSchedule } from '#types/ad-schedule';
import type { GetSeriesParams, Series } from '#types/series';
import { useConfigStore as ConfigStore } from '#src/stores/ConfigStore';
import { generateImageData } from '#src/utils/image';

// change the values below to change the property used to look up the alternate image
enum ImageProperty {
  SHELF = 'shelfImage',
  BACKGROUND = 'backgroundImage',
  CHANNEL_LOGO = 'channelLogoImage',
}

/**
 * Transform incoming media items
 * - Parses productId into MediaOffer[] for all cleeng offers
 */
export const transformMediaItem = (item: PlaylistItem, playlist?: Playlist) => {
  const config = ConfigStore.getState().config;

  return {
    ...item,
    shelfImage: generateImageData(config, ImageProperty.SHELF, item, playlist),
    backgroundImage: generateImageData(config, ImageProperty.BACKGROUND, item),
    channelLogoImage: generateImageData(config, ImageProperty.CHANNEL_LOGO, item),
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
  playlist.playlist = playlist.playlist.map((item) => transformMediaItem(item, playlist));

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

  return (data.playlist || []).map((item) => transformMediaItem(item, data));
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

/**
 * Get all series for the given media_ids
 * @param {string[]} mediaIds
 */
export const getSeriesByMediaIds = async (mediaIds: string[]): Promise<{ [key in typeof mediaIds[number]]: Series[] | undefined } | undefined> => {
  const pathname = `/apps/series`;
  const url = addQueryParams(`${import.meta.env.APP_API_BASE_URL}${pathname}`, {
    media_ids: mediaIds.join(','),
  });
  const response = await fetch(url);
  return await getDataOrThrow(response);
};

/**
 * Get series by id
 * @param {string} id
 * @param params
 */
export const getAdSchedule = async (id: string | undefined | null): Promise<AdSchedule | undefined> => {
  if (!id) {
    throw new Error('Ad Schedule ID is required');
  }

  const url = import.meta.env.APP_API_BASE_URL + `/v2/advertising/schedules/${id}.json`;
  const response = await fetch(url);
  const data = await getDataOrThrow(response);

  return data;
};
