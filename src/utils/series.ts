import type { Playlist, PlaylistItem } from '#types/playlist';
import type { Series } from '#types/series';

export const getFiltersFromSeries = (series: PlaylistItem[]): string[] =>
  series.reduce(
    (filters: string[], item) => (item.seasonNumber && filters.includes(item.seasonNumber) ? filters : filters.concat(item.seasonNumber || '')),
    [],
  );

export const filterSeries = (playlist: PlaylistItem[], filter: string) => {
  if (!filter) return playlist;

  return playlist.filter(({ seasonNumber }) => seasonNumber === filter);
};

/** Next episode to show after video is complete */
export const getNextEpisode = (series: Series, media: PlaylistItem): string => {
  // To handle array elements
  const season = Number(media.seasonNumber) - 1;
  const episodes = series.seasons[season]?.episodes;

  const episodeIndex = episodes?.findIndex((el) => el.media_id === media.mediaid);

  // If we have the last episode in the last season => we leave the same video
  if (series.seasons.length === season + 1 && episodeIndex === episodes.length - 1) {
    return media.mediaid;
  }

  // If we have the last episode in the current season => we change the season
  if (episodes.length - 1 === episodeIndex) {
    return series.seasons[season + 1]?.episodes[0]?.media_id;
  }

  return episodes[episodeIndex + 1]?.media_id;
};

export const getNextItemId = (item: PlaylistItem | undefined, series: Series | undefined, seriesPlaylist: Playlist | undefined): string | undefined => {
  if (!item || !seriesPlaylist) return;

  if (series) {
    return getNextEpisode(series, item);
  }

  const index = seriesPlaylist?.playlist?.findIndex(({ mediaid }) => mediaid === item.mediaid);

  return seriesPlaylist.playlist[index + 1].mediaid;
};
