import { CONTENT_TYPE } from '#src/config';
import type { Playlist, PlaylistItem } from '#types/playlist';

type RequiredProperties<T, P extends keyof T> = T & Required<Pick<T, P>>;

type DeprecatedPlaylistItem = {
  seriesPlayListId?: string;
  seriesPlaylistId?: string;
};

export const isPlaylist = (item: unknown): item is Playlist => !!item && typeof item === 'object' && 'feedid' in item;
export const isPlaylistItem = (item: unknown): item is PlaylistItem => !!item && typeof item === 'object' && 'mediaid' in item;

// For the deprecated series flow we store seriesId in custom params
export const getSeriesIdFromCustomParams = (item: PlaylistItem & DeprecatedPlaylistItem) => item.seriesPlayListId || item.seriesPlaylistId || item.seriesId;

// For the deprecated flow we store seriesId in the media custom params
export const isDeprecatedSeriesFlow = (item: PlaylistItem) => {
  return typeof getSeriesIdFromCustomParams(item) !== 'undefined';
};

// For the new series flow we use contentType custom param to define media item to be series
// In this case media item and series item have the same id
export const isNewSeriesFlow = (item: PlaylistItem) => item.contentType === CONTENT_TYPE.series;

export const isSeries = (item: PlaylistItem) => isDeprecatedSeriesFlow(item) || isNewSeriesFlow(item);

export const isEpisode = (item: PlaylistItem) => {
  return typeof item?.episodeNumber !== 'undefined' || item?.contentType === CONTENT_TYPE.episode;
};

export const getSeriesIdFromEpisode = (item: PlaylistItem | undefined) => {
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

  if (item.seriesId) {
    return item.seriesId;
  }

  return;
};

export const isLiveChannel = (item: PlaylistItem): item is RequiredProperties<PlaylistItem, 'contentType' | 'liveChannelsId'> =>
  item.contentType === 'LiveChannel' && !!item.liveChannelsId;
