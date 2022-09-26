import type { Playlist, PlaylistItem } from '#types/playlist';

type RequiredProperties<T, P extends keyof T> = T & Required<Pick<T, P>>;

type DeprecatedPlaylistItem = {
  seriesPlayListId?: string;
  seriesPlaylistId?: string;
};

export const getSeriesId = (item: PlaylistItem & DeprecatedPlaylistItem) => {
  if (!item) {
    return undefined;
  }

  return item['seriesPlayListId'] || item.seriesPlaylistId || item.seriesId;
};

export const isPlaylist = (item: unknown): item is Playlist => !!item && typeof item === 'object' && 'feedid' in item;
export const isPlaylistItem = (item: unknown): item is PlaylistItem => !!item && typeof item === 'object' && 'mediaid' in item;

export const isSeriesPlaceholder = (item: PlaylistItem) => {
  return typeof getSeriesId(item) !== 'undefined';
};

export const isEpisode = (item: PlaylistItem) => {
  return item && typeof item.episodeNumber !== 'undefined';
};

export const isLiveChannel = (item: PlaylistItem): item is RequiredProperties<PlaylistItem, 'contentType' | 'liveChannelsId'> =>
  item.contentType === 'LiveChannel' && !!item.liveChannelsId;

export const getSeriesIdFromEpisode = (item: PlaylistItem | undefined) => {
  if (!item || !isEpisode(item)) {
    return null;
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

  return null;
};
