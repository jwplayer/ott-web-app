import type { AppMenuType } from '@jwp/ott-common/types/config';

import type { PlaylistItem } from '../../types/playlist';
import { PATH_MEDIA, PATH_PLAYLIST, PATH_CONTENT_LIST } from '../paths';
import { logWarn } from '../logger';
import { APP_CONFIG_ITEM_TYPE } from '../constants';

import { getLegacySeriesPlaylistIdFromEpisodeTags, getSeriesPlaylistIdFromCustomParams } from './media';

export type QueryParamsArg = { [key: string]: string | number | string[] | undefined | null };

/**
 * Creates a new URL from an url string (preserving the search params) and an object to add and remove query params
 *
 * @example
 * createURL('/m/123456?play=1', { foo: 'bar' }) === '/m/123456?play=6&foo=bar'
 * createURL('/m/123456?play=1', { play: null }) === '/m/123456'
 *
 * // works with absolute URLs
 * createURL('https://jwplayer.com/m/123456?play=1', { play: null }) === 'https://jwplayer.com/m/123456'
 */
export const createURL = (url: string, queryParams: QueryParamsArg) => {
  const [baseUrl, urlQueryString = ''] = url.split('?');
  const urlSearchParams = new URLSearchParams(urlQueryString);

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

type ExtractRouteParams<T extends string> = T extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof ExtractRouteParams<Rest>]: string }
  : T extends `${infer _Start}:${infer Param}`
  ? { [K in Param]: string }
  : object;

type PathParams<T extends string> = T extends `${infer _Start}*` ? ExtractRouteParams<T> & Record<string, string | undefined> : ExtractRouteParams<T>;

// Creates a route path from a path string and params object
export const createPath = <Path extends string>(originalPath: Path, pathParams?: PathParams<Path>, queryParams?: QueryParamsArg): string => {
  const path = originalPath
    .split('/')
    .map((segment) => {
      if (segment === '*') {
        // Wild card for optional segments: add all params that are not already in the path
        if (!pathParams) return segment;

        return Object.entries(pathParams)
          .filter(([key]) => !originalPath.includes(key))
          .map(([_, value]) => value)
          .join('/');
      }
      if (!segment.startsWith(':') || !pathParams) return segment;

      // Check if param is optional, and show a warning if it's not optional and missing
      // Then remove all special characters to get the actual param name
      const isOptional = segment.endsWith('?');
      const paramName = segment.replace(':', '').replace('?', '');
      const paramValue = pathParams[paramName as keyof typeof pathParams];

      if (!paramValue) {
        if (!isOptional) {
          logWarn('urlFormatting', `Missing param in path creation`, {
            path: originalPath,
            paramName,
          });
        }

        return '';
      }

      return paramValue;
    })
    .join('/');

  // Optionally add the query params
  return queryParams ? createURL(path, queryParams) : path;
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
  id,
  title,
  playlistId,
  play = false,
  episodeId,
}: {
  id: string;
  title?: string;
  playlistId?: string | null;
  play?: boolean;
  episodeId?: string;
}) => {
  return createPath(
    PATH_MEDIA,
    { id, title: title ? slugify(title) : undefined },
    {
      r: playlistId,
      play: play ? '1' : null,
      e: episodeId,
    },
  );
};

export const playlistURL = (id: string, title?: string) => {
  return createPath(PATH_PLAYLIST, { id, title: title ? slugify(title) : undefined });
};

export const contentListURL = (id: string, title?: string) => {
  return createPath(PATH_CONTENT_LIST, { id, title: title ? slugify(title) : undefined });
};

export const determinePath = ({ type, contentId, label }: { type: AppMenuType | undefined; contentId: string; label?: string }) => {
  switch (type) {
    case APP_CONFIG_ITEM_TYPE.content_list:
      return contentListURL(contentId, label);
    case APP_CONFIG_ITEM_TYPE.media:
      return mediaURL({ id: contentId, title: label });
    case APP_CONFIG_ITEM_TYPE.playlist:
      return playlistURL(contentId, label);
    default:
      return '';
  }
};

export const liveChannelsURL = (playlistId: string, channelId?: string, play = false) => {
  return createPath(
    PATH_PLAYLIST,
    { id: playlistId },
    {
      channel: channelId,
      play: play ? '1' : null,
    },
  );
};

// Legacy URLs
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
