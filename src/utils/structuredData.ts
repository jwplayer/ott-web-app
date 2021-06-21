import type { Playlist, PlaylistItem } from '../../types/playlist';

import { episodeURL, movieURL } from './formatting';
import { secondsToISO8601 } from './datetime';

export const generateSeriesMetadata = (seriesPlaylist: Playlist) => {
  const seriesCanonical = `${window.location.origin}${episodeURL(seriesPlaylist)}`;

  return {
    '@type': 'TVSeries',
    '@id': seriesCanonical,
    name: seriesPlaylist.title,
    numberOfEpisodes: seriesPlaylist.playlist.length,
    numberOfSeasons: seriesPlaylist.playlist.reduce(function (list, playlistItem) {
      return !playlistItem.seasonNumber || list.includes(playlistItem.seasonNumber) ? list : list.concat(playlistItem.seasonNumber);
    }, [] as string[]).length,
  };
};

export const generateEpisodeJSONLD = (seriesPlaylist: Playlist, episode: PlaylistItem) => {
  const episodeCanonical = `${window.location.origin}${episodeURL(seriesPlaylist, episode.mediaid)}`;
  const seriesMetadata = generateSeriesMetadata(seriesPlaylist);

  return JSON.stringify({
    '@context': 'http://schema.org/',
    '@type': 'TVEpisode',
    '@id': episodeCanonical,
    episodeNumber: episode.episodeNumber,
    seasonNumber: episode.seasonNumber,
    name: episode.title,
    uploadDate: secondsToISO8601(episode.pubdate),
    partOfSeries: seriesMetadata,
  });
};

export const generateMovieJSONLD = (item: PlaylistItem) => {
  const movieCanonical = `${window.location.origin}${movieURL(item)}`;

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
