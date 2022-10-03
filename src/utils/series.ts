import type { Playlist, PlaylistItem } from '#types/playlist';
import type { EpisodeWithSeason, Season, Series } from '#types/series';

export const getFiltersFromSeries = (playlist: Playlist): string[] =>
  playlist.playlist.reduce(
    (filters: string[], item) => (item.seasonNumber && filters.includes(item.seasonNumber) ? filters : filters.concat(item.seasonNumber || '')),
    [],
  );

export const filterSeries = (playlist: Playlist, filter: string) => {
  if (!filter) return playlist;

  return {
    ...playlist,
    playlist: playlist.playlist.filter(({ seasonNumber }) => seasonNumber === filter),
  };
};

export const getSeriesEpisodes = (series: Series) => {
  if ('seasons' in series) {
    return series.seasons.flatMap((season: Season) => season.episodes);
  }

  return series.episodes;
};

/** Next episode to show after video is complete */
export const getNextEpisode = (series: Series, media: PlaylistItem): string => {
  // To handle array elements
  const episodes = getSeriesEpisodes(series);

  const episodeIndex = episodes?.findIndex((el) => el.media_id === media.mediaid);

  // If we have the last episode => we leave the same video
  if (episodeIndex === episodes.length - 1) {
    return media.mediaid;
  }

  return episodes[episodeIndex + 1]?.media_id;
};

export const getNextItem = (item: PlaylistItem | undefined, series: Series | undefined, seriesPlaylist: Playlist | undefined): PlaylistItem | undefined => {
  if (!item || !seriesPlaylist) return;

  if (series) {
    const nextEpisodeId = getNextEpisode(series, item);

    return seriesPlaylist.playlist.find((episode) => episode.mediaid === nextEpisodeId);
  }

  const index = seriesPlaylist?.playlist?.findIndex(({ mediaid }) => mediaid === item.mediaid);

  return seriesPlaylist?.playlist?.[index + 1];
};

/** We need to add episodeNumber and seasonNumber to each media item we got
 *  That will help with further data retrieval
 */
export const enrichMediaItems = (series: Series | undefined, mediaItems: PlaylistItem[] | undefined): PlaylistItem[] => {
  let episodes: EpisodeWithSeason[] = [];

  if (series) {
    episodes =
      'seasons' in series
        ? series.seasons.flatMap((season: Season) =>
            season.episodes.map((episode) => ({
              ...episode,
              season_number: season.season_number,
            })),
          )
        : series.episodes.map((episode) => ({ ...episode, season_number: 0 }));
  }

  const itemsWithEpisodes = (mediaItems || []).map((item) => {
    const episode = episodes.find((episode) => episode.media_id === item?.mediaid);

    return {
      ...item,
      seasonNumber: String(episode?.season_number || '0'),
      episodeNumber: String(episode?.episode_number || '0'),
    };
  });

  return itemsWithEpisodes;
};
