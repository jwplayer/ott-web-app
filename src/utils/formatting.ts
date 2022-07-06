import { getSeriesId, getSeriesIdFromEpisode, isEpisode, isSeriesPlaceholder } from '#src/utils/media';
import type { Playlist, PlaylistItem } from '#types/playlist';

export const formatDurationTag = (seconds: number): string | null => {
  if (!seconds) return null;

  const minutes = Math.ceil(seconds / 60);

  return `${minutes} min`;
};

/**
 * @param duration Duration in seconds
 *
 * Calculates hours and minutes into a string
 * Hours are only shown if at least 1
 * Minutes get rounded
 *
 * @returns string, such as '2h 24m' or '31m'
 */

export const formatDuration = (duration: number): string | null => {
  if (!duration) return null;

  const hours = Math.floor(duration / 3600);
  const minutes = Math.round((duration - hours * 3600) / 60);

  const hoursString = hours ? `${hours}h ` : '';
  const minutesString = minutes ? `${minutes}m ` : '';

  return `${hoursString}${minutesString}`;
};

export const addQueryParams = (url: string, queryParams: { [key: string]: string | number | string[] | undefined | null }) => {
  const queryStringIndex = url.indexOf('?');
  const urlWithoutSearch = queryStringIndex > -1 ? url.slice(0, queryStringIndex) : url;
  const urlSearchParams = new URLSearchParams(queryStringIndex > -1 ? url.slice(queryStringIndex) : undefined);

  Object.keys(queryParams).forEach((key) => {
    const value = queryParams[key];

    // null or undefined
    if (value == null) return;

    if (typeof value === 'object' && !value?.length) return;

    const formattedValue = Array.isArray(value) ? value.join(',') : value;

    urlSearchParams.set(key, String(formattedValue));
  });
  const queryString = urlSearchParams.toString();

  return `${urlWithoutSearch}${queryString ? `?${queryString}` : ''}`;
};

export const slugify = (text: string, whitespaceChar: string = '-') =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .replace(/-/g, whitespaceChar);

export const movieURL = (item: PlaylistItem, playlistId?: string | null, play: boolean = false) =>
  addQueryParams(`/m/${item.mediaid}/${slugify(item.title)}`, { r: playlistId, play: play ? '1' : null });

export const seriesURL = (item: PlaylistItem, playlistId?: string | null, play: boolean = false) => {
  const seriesId = getSeriesId(item);

  return addQueryParams(`/s/${seriesId}/${slugify(item.title)}`, {
    r: playlistId,
    play: play ? '1' : null,
  });
};

export const episodeURL = (seriesPlaylist: Playlist, episodeId?: string, play: boolean = false, playlistId?: string | null) =>
  addQueryParams(`/s/${seriesPlaylist.feedid}/${slugify(seriesPlaylist.title)}`, {
    e: episodeId,
    r: playlistId,
    play: play ? '1' : null,
  });

export const episodeURLFromEpisode = (item: PlaylistItem, seriesId: string, playlistId?: string | null, play: boolean = false) => {
  // generated URL does not match the canonical URL. We need the series playlist in order to generate the slug. For
  // now the item title is used instead. The canonical link isn't affected by this though.
  return addQueryParams(`/s/${seriesId}/${slugify(item.title)}`, {
    e: item.mediaid,
    r: playlistId,
    play: play ? '1' : null,
  });
};

export const cardUrl = (item: PlaylistItem, playlistId?: string | null, play: boolean = false) => {
  if (isEpisode(item)) {
    const seriesId = getSeriesIdFromEpisode(item);

    return seriesId ? episodeURLFromEpisode(item, seriesId, playlistId, play) : movieURL(item);
  }

  return isSeriesPlaceholder(item) ? seriesURL(item, playlistId, play) : movieURL(item, playlistId, play);
};

export const videoUrl = (item: PlaylistItem, playlistId?: string | null, play: boolean = false) =>
  addQueryParams(item.seriesId ? seriesURL(item, playlistId) : movieURL(item, playlistId), {
    play: play ? '1' : null,
  });

export const formatDate = (dateString: number) => {
  if (!dateString) return '';

  return new Date(dateString * 1000).toLocaleDateString();
};

export const formatPrice = (price: number, currency: string, country: string) => {
  return new Intl.NumberFormat(country, {
    style: 'currency',
    currency: currency,
  }).format(price);
};
