import { mediaURL } from './formatting';
import { secondsToISO8601 } from './datetime';

import type { PlaylistItem } from '#types/playlist';
import type { EpisodeMetadata, Series } from '#types/series';

export const generateMovieJSONLD = (item: PlaylistItem) => {
  const movieCanonical = `${window.location.origin}${mediaURL({ media: item })}`;

  return JSON.stringify({
    '@context': 'http://schema.org/',
    '@type': 'VideoObject',
    '@id': movieCanonical,
    name: item.title,
    description: item.description,
    duration: secondsToISO8601(item.duration, true),
    thumbnailUrl: item.image,
    uploadDate: secondsToISO8601(item.pubdate),
  });
};

export const generateSeriesMetadata = (series: Series, media: PlaylistItem, seriesId: string | undefined) => {
  // Use playlist for old flow and media id for a new flow
  const seriesCanonical = `${window.location.origin}/m/${seriesId}`;

  return {
    '@type': 'TVSeries',
    '@id': seriesCanonical,
    name: media.title,
    numberOfEpisodes: String(series?.episode_count || 0),
    numberOfSeasons: String(series?.season_count || 0),
  };
};

export const generateEpisodeJSONLD = (series: Series, media: PlaylistItem, episode: PlaylistItem | undefined, episodeMetadata: EpisodeMetadata | undefined) => {
  const episodeCanonical = `${window.location.origin}/m/${series.series_id}?e=${episode?.mediaid}`;
  const seriesMetadata = generateSeriesMetadata(series, media, series.series_id);

  if (!episode) {
    return JSON.stringify(seriesMetadata);
  }

  return JSON.stringify({
    '@context': 'http://schema.org/',
    '@type': 'TVEpisode',
    '@id': episodeCanonical,
    episodeNumber: episodeMetadata?.episodeNumber || '0',
    seasonNumber: episodeMetadata?.seasonNumber || '0',
    name: episode.title,
    uploadDate: secondsToISO8601(episode.pubdate),
    partOfSeries: seriesMetadata,
  });
};
