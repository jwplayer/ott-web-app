import type { PlaylistItem } from '../../types/playlist';

import { filterMediaOffers } from './entitlements';

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

export const isSeriesPlaceholder = (item: PlaylistItem) => {
  return typeof getSeriesId(item) !== 'undefined';
};

export const isEpisode = (item: PlaylistItem) => {
  return item && typeof item.episodeNumber !== 'undefined';
};

export const getSeriesIdFromEpisode = (item: PlaylistItem) => {
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

  return null;
};

// Transfrom media items
// Parses productId into MediaOffer[] for all cleeng offers
export const transformMediaItem = (item: PlaylistItem) => {
  return {
    ...item,
    mediaOffers: item.productIds ? filterMediaOffers('cleeng', item.productIds) : undefined,
  };
};
