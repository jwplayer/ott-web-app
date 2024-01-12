import type { PlaylistItem } from '../../types/playlist';

import { getLegacySeriesPlaylistIdFromEpisodeTags, getSeriesPlaylistIdFromCustomParams } from './media';

// Creates a new URL from a url string, search string and an object to add and remove query params
// For example:
// createURL(window.location.pathname, { foo: 'bar' }, window.location.search);
export const createURL = (url: string, queryParams: { [key: string]: string | number | string[] | undefined | null }, search: string | null = '') => {
  const [baseUrl, urlQueryString = ''] = url.split('?');
  const searchStringCombined = `${urlQueryString}${urlQueryString && search ? `&` : ''}${search}`;

  const urlSearchParams = new URLSearchParams(searchStringCombined);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return urlSearchParams.delete(key);
    }

    const formattedValue = Array.isArray(value) ? value.join(',') : value;

    urlSearchParams.set(key, String(formattedValue));
  });

  const queryString = urlSearchParams.toString();

  return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
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
}) => {
  return createURL(`/m/${media.mediaid}/${slugify(media.title)}`, { r: playlistId, play: play ? '1' : null, e: episodeId });
};

export const liveChannelsURL = (playlistId: string, channelId?: string, play = false) => {
  return createURL(`/p/${playlistId}`, {
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
}) => createURL(`/s/${seriesId}`, { r: playlistId, e: episodeId, play: play ? '1' : null });

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
