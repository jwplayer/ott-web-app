import { deprecatedSeriesURL, mediaURL } from './formatting';
import { secondsToISO8601 } from './datetime';

import type { Playlist, PlaylistItem } from '#types/playlist';
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

export const generateLegacySeriesMetadata = (seriesPlaylist: Playlist, seriesId: string | undefined) => {
  // Use playlist for old flow and media id for a new flow
  const seriesCanonical = `${window.location.origin}/s/${seriesId}`;

  return {
    '@type': 'TVSeries',
    '@id': seriesCanonical,
    name: seriesPlaylist.title,
    numberOfEpisodes: String(seriesPlaylist.playlist.length),
    numberOfSeasons: String(
      seriesPlaylist.playlist.reduce(function (list, playlistItem) {
        return !playlistItem.seasonNumber || list.includes(playlistItem.seasonNumber) ? list : list.concat(playlistItem.seasonNumber);
      }, [] as string[]).length,
    ),
  };
};

export const generateLegacyEpisodeJSONLD = (
  seriesPlaylist: Playlist,
  episode: PlaylistItem | undefined,
  episodeMetadata: EpisodeMetadata | undefined,
  seriesId: string,
) => {
  const episodeCanonical = `${window.location.origin}${deprecatedSeriesURL({ episodeId: episode?.mediaid, seriesId })}`;
  const seriesMetadata = generateLegacySeriesMetadata(seriesPlaylist, seriesId);

  if (!episode) {
    return JSON.stringify(seriesMetadata);
  }

  return JSON.stringify({
    '@context': 'http://schema.org/',
    '@type': 'TVEpisode',
    '@id': episodeCanonical,
    episodeNumber: episodeMetadata?.episodeNumber,
    seasonNumber: episodeMetadata?.seasonNumber,
    name: episode.title,
    uploadDate: secondsToISO8601(episode.pubdate),
    partOfSeries: seriesMetadata,
  });
};

export const generateSeriesMetadata = (series: Series, media: PlaylistItem, seriesId: string | undefined) => {
  // Use playlist for old flow and media id for a new flow
  const seriesCanonical = `${window.location.origin}/m/${seriesId}`;

  return {
    '@type': 'TVSeries',
    '@id': seriesCanonical,
    name: media.title,
    numberOfEpisodes: String(series?.episode_count),
    numberOfSeasons: String(series?.season_count || 0),
  };
};

export const generateEpisodeJSONLD = (
  series: Series,
  media: PlaylistItem,
  episode: PlaylistItem | undefined,
  episodeMetadata: EpisodeMetadata | undefined,
  seriesId: string,
) => {
  const episodeCanonical = `${window.location.origin}${mediaURL({ media, episodeId: episode?.mediaid })}`;
  const seriesMetadata = generateSeriesMetadata(series, media, seriesId);

  if (!episode) {
    return JSON.stringify(seriesMetadata);
  }

  return JSON.stringify({
    '@context': 'http://schema.org/',
    '@type': 'TVEpisode',
    '@id': episodeCanonical,
    episodeNumber: episodeMetadata?.episodeNumber,
    seasonNumber: episodeMetadata?.seasonNumber,
    name: episode.title,
    uploadDate: secondsToISO8601(episode.pubdate),
    partOfSeries: seriesMetadata,
  });
};
