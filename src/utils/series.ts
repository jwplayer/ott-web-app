import { secondsToISO8601 } from './datetime';
import { addQueryParams, slugify } from './formatting';

import type { PlaylistItem } from '#types/playlist';
import type { EpisodeWithSeason, Season, Series } from '#types/series';

export const episodeURL = (series: Series, episodeId?: string, play: boolean = false, playlistId?: string | null) =>
  addQueryParams(`/s/${series.series_id}/${slugify(series.title)}`, {
    e: episodeId,
    r: playlistId,
    play: play ? '1' : null,
  });

export const generateSeriesMetadata = (seriesPlaylist: Series) => {
  const seriesCanonical = `${window.location.origin}${episodeURL(seriesPlaylist)}`;

  return {
    '@type': 'TVSeries',
    '@id': seriesCanonical,
    name: seriesPlaylist.title,
    numberOfEpisodes: seriesPlaylist.episode_count,
    numberOfSeasons: seriesPlaylist.seasons.length,
  };
};

export const generateEpisodeJSONLD = (seriesPlaylist: Series, episode: PlaylistItem) => {
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

/** We need to add episodeNumber and seasonNumber to each media item we got via watchlists
 *  That will help with further data retrieval
 */
export const enrichMediaItems = (series: Series | undefined, mediaItems: PlaylistItem[] | undefined): PlaylistItem[] => {
  const episodes = (series?.seasons || []).reduce((acc: EpisodeWithSeason[], season: Season) => {
    const episodes = season.episodes.map((episode) => ({ ...episode, season_number: season.season_number }));

    return [...acc, ...episodes];
  }, []);

  const itemsWithEpisodes = (mediaItems || []).map((item) => {
    const episode = episodes.find((episode) => episode.media_id === item.mediaid) as EpisodeWithSeason;

    return { ...item, seasonNumber: String(episode.season_number), episodeNumber: String(episode.episode_number) };
  });

  return itemsWithEpisodes;
};

/** Next episode to show after video is complete */
export const getNextEpisode = (series: Series, seasonNumber: number, media: PlaylistItem) => {
  const episodes = series.seasons[seasonNumber - 1].episodes;

  const episodeIndex = episodes.findIndex((el) => el.media_id === media.mediaid);

  // If we have the last episode in the last season => we leave the same video
  if (series.seasons.length === seasonNumber && episodeIndex === episodes.length - 1) {
    return media.mediaid;
  }

  // If we have the last episode in the current season => we change the season
  if (episodes.length - 1 === episodeIndex) {
    return series.seasons[seasonNumber + 1].episodes[0].media_id;
  }

  return episodes[episodeIndex + 1].media_id;
};

/** Current item we show on the Series page (we need to add episodeId and seasonId to be displayed properly) */
export const enrichMediaItem = (mediaItems: PlaylistItem[], item: PlaylistItem | undefined): PlaylistItem | undefined => {
  if (!item) {
    return undefined;
  }

  const mediaItem = mediaItems.find((el) => el.mediaid === item?.mediaid) as PlaylistItem;

  if (!mediaItem) {
    return undefined;
  }

  return { ...item, episodeNumber: mediaItem.episodeNumber, seasonNumber: mediaItem.seasonNumber };
};

/** Items to show when applying a season filter */
export const getSelectedMediaItems = (mediaItems: PlaylistItem[], season: string): PlaylistItem[] => {
  if (!season) {
    return mediaItems;
  }

  return mediaItems.filter((item) => item.seasonNumber === season);
};

/** Options to build a seasons filter */
export const getFilterOptions = (series: Series | undefined) => (series?.seasons || []).map((_, idx) => String(idx + 1));
