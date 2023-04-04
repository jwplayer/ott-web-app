import type { Playlist, PlaylistItem } from '#types/playlist';
import type { Season, Series } from '#types/series';

export const getFiltersFromSeries = (playlist: Playlist): string[] =>
  playlist.playlist
    .reduce((filters: string[], item) => (item.seasonNumber && filters.includes(item.seasonNumber) ? filters : filters.concat(item.seasonNumber || '')), [])
    .slice()
    .sort();

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
export const enrichMediaItems = (series: Series | undefined, mediaItems: { [key: string]: PlaylistItem }): PlaylistItem[] => {
  if (series) {
    if ('seasons' in series) {
      return series.seasons.flatMap((season: Season) =>
        season.episodes.map((episode) => ({
          ...mediaItems[episode.media_id],
          seasonNumber: String(season.season_number),
          episodeNumber: String(episode.episode_number),
        })),
      );
    }

    return series.episodes.map((episode) => ({ ...mediaItems[episode.media_id], seasonNumber: '1', episodeNumber: String(episode.episode_number) }));
  }

  return [];
};
