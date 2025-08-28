import type { PlaylistItem } from '../../types/playlist';
import { MEDIA_CONTENT_TYPE } from '../constants';

import { isContentType } from './common';
import { isLiveEvent } from './liveEvent';

type RequiredProperties<T, P extends keyof T> = T & Required<Pick<T, P>>;

type DeprecatedPlaylistItem = {
  seriesPlayListId?: string;
  seriesPlaylistId?: string;
};

// For the deprecated series flow we store seriesId in custom params
export const getSeriesPlaylistIdFromCustomParams = (item: (PlaylistItem & DeprecatedPlaylistItem) | undefined) =>
  item ? item.seriesPlayListId || item.seriesPlaylistId || item.seriesId : undefined;

// For the deprecated flow we store seriesId in the media custom params
export const isLegacySeriesFlow = (item: PlaylistItem) => {
  return typeof getSeriesPlaylistIdFromCustomParams(item) !== 'undefined';
};

// For the new series flow we use contentType custom param to define media item to be series
// In this case media item and series item have the same id
export const isSeriesContentType = (item: PlaylistItem) => isContentType(item, MEDIA_CONTENT_TYPE.series);

export const isSeries = (item: PlaylistItem) => isLegacySeriesFlow(item) || isSeriesContentType(item);

export const isEpisode = (item: PlaylistItem) => {
  return typeof item?.episodeNumber !== 'undefined' || isContentType(item, MEDIA_CONTENT_TYPE.episode);
};

export const getLegacySeriesPlaylistIdFromEpisodeTags = (item: PlaylistItem | undefined) => {
  if (!item || !isEpisode(item)) {
    return;
  }

  const tags = item.tags ? item.tags.split(',') : [];
  const seriesIdTag = tags.find(function (tag) {
    return /seriesid_([\w\d]+)/i.test(tag);
  });

  if (seriesIdTag) {
    return seriesIdTag.split('_')[1];
  }

  return;
};

export const isLiveChannel = (item: PlaylistItem): item is RequiredProperties<PlaylistItem, 'contentType'> =>
  isContentType(item, MEDIA_CONTENT_TYPE.liveChannel);

export const hasSupplementaryCardInfo = (item: PlaylistItem) => (!!item.scheduledStart && isLiveEvent(item)) || !!item.subtitle;
