import { parseISO } from 'date-fns';

import { getMediaStatusFromEventState } from '../utils/liveEvent';

import { addQueryParams } from '#src/utils/formatting';
import { getDataOrThrow } from '#src/utils/api';
import { filterMediaOffers } from '#src/utils/entitlements';
import type { GetPlaylistParams, Playlist, PlaylistItem } from '#types/playlist';
import type { AdSchedule } from '#types/ad-schedule';
import type { EpisodesRes, EpisodesWithPagination, GetSeriesParams, Series, EpisodeInSeries } from '#types/series';
import { useConfigStore as ConfigStore } from '#src/stores/ConfigStore';

// change the values below to change the property used to look up the alternate image
enum ImageProperty {
  CARD = 'card',
  BACKGROUND = 'background',
  CHANNEL_LOGO = 'channel_logo',
}

const PAGE_LIMIT = 20;

/**
 * We use playlistLabel prop to define the label used for all media items inside.
 * That way we can change the behavior of the same media items being in different playlists
 */
const generateAlternateImageURL = ({ item, label, playlistLabel }: { item: PlaylistItem; label: string; playlistLabel?: string }) => {
  const pathname = `/v2/media/${item.mediaid}/images/${playlistLabel || label}.webp`;
  const url = addQueryParams(`${import.meta.env.APP_API_BASE_URL}${pathname}`, { poster_fallback: 1, fallback: playlistLabel ? label : null });

  return url;
};

/**
 * Transform incoming media items
 * - Parses productId into MediaOffer[] for all cleeng offers
 */
export const transformMediaItem = (item: PlaylistItem, playlist?: Playlist) => {
  const config = ConfigStore.getState().config;
  const offerKeys = Object.keys(config?.integrations)[0];
  const playlistLabel = playlist?.imageLabel;

  const transformedMediaItem = {
    ...item,
    cardImage: generateAlternateImageURL({ item, label: ImageProperty.CARD, playlistLabel }),
    channelLogoImage: generateAlternateImageURL({ item, label: ImageProperty.CHANNEL_LOGO, playlistLabel }),
    backgroundImage: generateAlternateImageURL({ item, label: ImageProperty.BACKGROUND }),
    mediaOffers: item.productIds ? filterMediaOffers(offerKeys, item.productIds) : undefined,
    scheduledStart: item['VCH.ScheduledStart'] ? parseISO(item['VCH.ScheduledStart'] as string) : undefined,
    scheduledEnd: item['VCH.ScheduledEnd'] ? parseISO(item['VCH.ScheduledEnd'] as string) : undefined,
  };

  // add the media status to the media item after the transformation because the live media status depends on the scheduledStart and scheduledEnd
  transformedMediaItem.mediaStatus = getMediaStatusFromEventState(transformedMediaItem);

  return transformedMediaItem;
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
export const getPlaylistById = async (id?: string, params: GetPlaylistParams = {}): Promise<Playlist | undefined> => {
  if (!id) {
    return undefined;
  }

  const pathname = `/v2/playlists/${id}`;
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

  return (data.playlist || []).map((item) => transformMediaItem(item));
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
export const getSeriesByMediaIds = async (mediaIds: string[]): Promise<{ [mediaId: string]: EpisodeInSeries[] | undefined } | undefined> => {
  const pathname = `/apps/series`;
  const url = `${import.meta.env.APP_API_BASE_URL}${pathname}?media_ids=${mediaIds.join(',')}`;
  const response = await fetch(url);
  return await getDataOrThrow(response);
};

/**
 * Get all episodes of the selected series (when no particular season is selected or when episodes are attached to series)
 * @param {string} seriesId
 */
export const getEpisodes = async ({
  seriesId,
  pageOffset,
  pageLimit = PAGE_LIMIT,
  afterId,
}: {
  seriesId: string | undefined;
  pageOffset?: number;
  pageLimit?: number;
  afterId?: string;
}): Promise<EpisodesWithPagination> => {
  if (!seriesId) {
    throw new Error('Series ID is required');
  }

  const pathname = `/apps/series/${seriesId}/episodes`;
  const url = addQueryParams(`${import.meta.env.APP_API_BASE_URL}${pathname}`, {
    page_offset: pageOffset,
    page_limit: pageLimit,
    after_id: afterId,
  });

  const response = await fetch(url);
  const { episodes, page, page_limit, total }: EpisodesRes = await getDataOrThrow(response);

  // Adding images and keys for media items
  return {
    episodes: episodes.map((el) => ({
      ...transformMediaItem(el.media_item),
      seasonNumber: el.season_number ? String(el.season_number) : '',
      episodeNumber: String(el.episode_number),
    })),
    pagination: { page, page_limit, total },
  };
};

/**
 * Get season of the selected series
 * @param {string} seriesId
 */
export const getSeasonWithEpisodes = async ({
  seriesId,
  seasonNumber,
  pageOffset,
  pageLimit = PAGE_LIMIT,
}: {
  seriesId: string | undefined;
  seasonNumber: number;
  pageOffset?: number;
  pageLimit?: number;
}): Promise<EpisodesWithPagination> => {
  if (!seriesId) {
    throw new Error('Series ID is required');
  }

  const pathname = `/apps/series/${seriesId}/seasons/${seasonNumber}/episodes`;
  const url = addQueryParams(`${import.meta.env.APP_API_BASE_URL}${pathname}`, { page_offset: pageOffset, page_limit: pageLimit });

  const response = await fetch(url);
  const { episodes, page, page_limit, total }: EpisodesRes = await getDataOrThrow(response);

  // Adding images and keys for media items
  return {
    episodes: episodes.map((el) => ({
      ...transformMediaItem(el.media_item),
      seasonNumber: String(seasonNumber),
      episodeNumber: String(el.episode_number),
    })),
    pagination: { page, page_limit, total },
  };
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
