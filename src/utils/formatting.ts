import { getLegacySeriesPlaylistIdFromEpisodeTags, getSeriesPlaylistIdFromCustomParams } from './media';

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

export function removeQueryParamFromUrl(key: string): string {
  const url = new URL(window.location.href);
  const urlSearchParams = new URLSearchParams(url.search);

  urlSearchParams.delete(key);

  const searchParams = urlSearchParams.toString();

  return `${url.pathname}${searchParams ? `?${searchParams}` : ''}`;
}

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

export const mediaURL = ({
  media,
  playlistId,
  play = false,
  episodeId,
}: {
  media: PlaylistItem;
  playlistId?: string | null;
  play?: boolean;
  episodeId?: string;
}) => addQueryParams(`/m/${media.mediaid}/${slugify(media.title)}`, { r: playlistId, play: play ? '1' : null, e: episodeId });

export const liveChannelsURL = (playlistId: string, channelId?: string, play = false) => {
  return addQueryParams(`/p/${playlistId}`, {
    channel: channelId,
    play: play ? '1' : null,
  });
};

export const legacySeriesURL = ({
  seriesId,
  episodeId,
  play,
  playlistId,
}: {
  seriesId: string;
  episodeId?: string;
  play?: boolean;
  playlistId?: string | null;
}) => addQueryParams(`/s/${seriesId}`, { r: playlistId, e: episodeId, play: play ? '1' : null });

export const buildLegacySeriesUrlFromMediaItem = (media: PlaylistItem, play: boolean, playlistId: string | null) => {
  const legacyPlaylistIdFromTags = getLegacySeriesPlaylistIdFromEpisodeTags(media);
  const legacyPlaylistIdFromCustomParams = getSeriesPlaylistIdFromCustomParams(media);

  return legacySeriesURL({
    // Use the id grabbed from either custom params for series or tags for an episode
    seriesId: legacyPlaylistIdFromCustomParams || legacyPlaylistIdFromTags || '',
    play,
    playlistId,
    // Add episode id only if series id can be retrieved from tags
    episodeId: legacyPlaylistIdFromTags && media.mediaid,
  });
};

export const formatPrice = (price: number, currency: string, country?: string) => {
  return new Intl.NumberFormat(country || 'en-US', {
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

export const formatPlaylistMetaString = (item: Playlist, episodesLabel?: string) => {
  const metaData = [];

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

export const formatLiveEventMetaString = (media: PlaylistItem, locale: string) => {
  const metaData = [];
  const scheduled = formatVideoSchedule(locale, media.scheduledStart, media.scheduledEnd);

  if (scheduled) metaData.push(scheduled);
  if (media.duration) metaData.push(formatDuration(media.duration));
  if (media.genre) metaData.push(media.genre);
  if (media.rating) metaData.push(media.rating);

  return metaData.join(' • ');
};

export const formatVideoSchedule = (locale: string, scheduledStart?: Date, scheduledEnd?: Date) => {
  if (!scheduledStart) {
    return '';
  }

  if (!scheduledEnd) {
    return formatLocalizedDateTime(scheduledStart, locale, ' • ');
  }

  return `${formatLocalizedDateTime(scheduledStart, locale, ' • ')} - ${formatLocalizedTime(scheduledEnd, locale)}`;
};

export const formatLocalizedDate = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

export const formatLocalizedTime = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: 'numeric' }).format(date);
};

export const formatLocalizedDateTime = (date: Date, locale: string, separator = ' ') => {
  return `${formatLocalizedDate(date, locale)}${separator}${formatLocalizedTime(date, locale)}`;
};
