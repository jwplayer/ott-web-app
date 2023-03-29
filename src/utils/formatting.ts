import type { PlaylistItem } from '#types/playlist';

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

export const mediaURL = (item: PlaylistItem, playlistId?: string | null, play = false) =>
  addQueryParams(`/m/${item.mediaid}/${slugify(item.title)}`, { r: playlistId, play: play ? '1' : null });

export const liveChannelsURL = (playlistId: string, channelId?: string, play = false) => {
  return addQueryParams(`/p/${playlistId}`, {
    channel: channelId,
    play: play ? '1' : null,
  });
};

export const episodeURL = (episode: PlaylistItem, seriesId?: string, play: boolean = false, playlistId?: string | null) =>
  addQueryParams(mediaURL(episode, playlistId, play), {
    seriesId,
  });

export const formatDate = (dateString: number) => {
  if (!dateString) return '';

  return new Date(dateString * 1000).toLocaleDateString();
};

export const formatPrice = (price: number, currency: string, country: string) => {
  return new Intl.NumberFormat(country || undefined, {
    style: 'currency',
    currency: currency,
  }).format(price);
};

export const formatVideoMetaString = (item: PlaylistItem, episodesLabel?: string) => {
  const metaData = [];

  if (item.pubdate) metaData.push(new Date(item.pubdate * 1000).getFullYear());
  if (!episodesLabel && item.duration) metaData.push(formatDuration(item.duration));
  if (episodesLabel) metaData.push(episodesLabel);
  if (item.genre) metaData.push(item.genre);
  if (item.rating) metaData.push(item.rating);

  return metaData.join(' • ');
};

export const formatSeriesMetaString = (seasonNumber?: string, episodeNumber?: string) => {
  if (!seasonNumber && !episodeNumber) {
    return '';
  }

  return seasonNumber && seasonNumber !== '0' ? `S${seasonNumber}:E${episodeNumber}` : `E${episodeNumber}`;
};
