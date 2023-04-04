import { episodeURL, mediaURL } from './formatting';
import { secondsToISO8601 } from './datetime';

import type { Playlist, PlaylistItem } from '#types/playlist';

export const generateSeriesMetadata = (seriesPlaylist: Playlist, mediaId: string | undefined) => {
  // Use playlist for old flow and media id for a new flow
  const seriesCanonical = `${window.location.origin}/m/${seriesPlaylist.feedid || mediaId}`;

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

export const generateEpisodeJSONLD = (seriesPlaylist: Playlist, episode: PlaylistItem, seriesId: string | undefined, mediaId: string | undefined) => {
  const episodeCanonical = `${window.location.origin}${episodeURL({ episode, playlistId: seriesPlaylist.feedid, mediaId, seriesId })}`;
  const seriesMetadata = generateSeriesMetadata(seriesPlaylist, mediaId);

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
  const movieCanonical = `${window.location.origin}${mediaURL(item)}`;

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
