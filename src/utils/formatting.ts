import type { Playlist, PlaylistItem } from 'types/playlist';

const formatDurationTag = (seconds: number): string | null => {
  if (!seconds || typeof seconds !== 'number') return null;

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

const formatDuration = (duration: number): string | null => {
  if (!duration || typeof duration !== 'number') return null;

  const hours = Math.floor(duration / 3600);
  const minutes = Math.round((duration - hours * 3600) / 60);

  const hoursString = hours ? `${hours}h ` : '';
  const minutesString = minutes ? `${minutes}m ` : '';

  return `${hoursString}${minutesString}`;
};

export const addQueryParams = (url: string, queryParams: { [key: string]: string | undefined | null }) => {
  const queryStringIndex = url.indexOf('?');
  const urlWithoutSearch = queryStringIndex > -1 ? url.slice(0, queryStringIndex) : url;
  const urlSearchParams = new URLSearchParams(queryStringIndex > -1 ? url.slice(queryStringIndex) : undefined);

  Object.keys(queryParams).forEach((key) => {
    const value = queryParams[key];

    if (typeof value !== 'string') return;

    urlSearchParams.set(key, value);
  });
  const queryString = urlSearchParams.toString();

  return `${urlWithoutSearch}${queryString ? `?${queryString}` : ''}`;
};

const slugify = (text: string, whitespaceChar: string = '-') =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .replace(/-/g, whitespaceChar);

const movieURL = (item: PlaylistItem, playlistId?: string | null) =>
  addQueryParams(`/m/${item.mediaid}/${slugify(item.title)}`, { r: playlistId });

const seriesURL = (item: PlaylistItem, playlistId?: string | null) =>
  addQueryParams(`/s/${item.seriesId}/${slugify(item.title)}`, { r: playlistId });

const episodeURL = (seriesPlaylist: Playlist, episodeId?: string, play: boolean = false) =>
  addQueryParams(`/s/${seriesPlaylist.feedid}/${slugify(seriesPlaylist.title)}`, {
    e: episodeId,
    play: play ? '1' : null,
  });

const cardUrl = (item: PlaylistItem, playlistId?: string | null) =>
  item.seriesId ? seriesURL(item, playlistId) : movieURL(item, playlistId);

const videoUrl = (item: PlaylistItem, playlistId?: string | null, play: boolean = false) =>
  addQueryParams(item.seriesId ? seriesURL(item, playlistId) : movieURL(item, playlistId), {
    play: play ? '1' : null,
  });

export { formatDurationTag, formatDuration, cardUrl, movieURL, seriesURL, videoUrl, episodeURL };
