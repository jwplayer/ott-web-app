import type { Playlist, PlaylistItem } from '#types/playlist';
import type { EpisodesWithPagination, Series } from '#types/series';

/**
 * Get an array of options for a season filter
 */
export const getFiltersFromSeries = (playlist: Playlist, series: Series | undefined): string[] => {
  const isNewFlow = !!series;

  // For the new series flow we already have episodes sorted correctly on the back-end side
  if (isNewFlow) {
    return 'seasons' in series ? series.seasons.map((season) => String(season.season_number)) : [];
  }

  // Old series doesn't have sorting supported and just aggregates all episodes in one playlist
  // So we need to sort the playlist manually based on the selected filter (season).
  return playlist.playlist
    .reduce((filters: string[], item) => (item.seasonNumber && filters.includes(item.seasonNumber) ? filters : filters.concat(item.seasonNumber || '')), [])
    .slice()
    .sort();
};

/**
 * Get a playlist with episodes based on the selected filter
 */
export const filterSeries = (playlist: Playlist, episodes: EpisodesWithPagination[] | undefined, filter: string): Playlist => {
  const isNewFlow = !!episodes?.length;

  if (isNewFlow) {
    // Get a flattened list of episodes and return it as part of the playlist
    return { ...playlist, playlist: episodes.flatMap((e) => e.episodes) };
  }

  if (!filter) return playlist;

  return {
    ...playlist,
    // Filter episodes manually for the old flow where our playlists includes all episodes with all seasons
    playlist: playlist.playlist.filter(({ seasonNumber }) => seasonNumber === filter),
  };
};

export const getNextEpisode = (data: EpisodesWithPagination[], currentEpisode: PlaylistItem, hasMoreEpisodes: boolean, fetchNextEpisodes: () => void) => {
  const episodes = data.flatMap((el) => el.episodes);
  const episodeIndex = episodes.findIndex((el) => el.mediaid === currentEpisode.mediaid);

  // If there are more episodes in the selected season / episodes list
  if (episodeIndex !== episodes.length - 1) {
    return episodes[episodeIndex + 1];
    // Episode is the last one in the data we have, but we have more to fetch, let's do it
  } else if (hasMoreEpisodes) {
    fetchNextEpisodes();
    return currentEpisode;
    // No more data to fetch -> return null
  } else {
    return;
  }
};

export const getNextItem = (
  episode: PlaylistItem | undefined,
  seriesPlaylist: Playlist,
  episodes: EpisodesWithPagination[] | undefined,
  hasMoreEpisodes: boolean,
  fetchNextEpisodes: () => void,
): PlaylistItem | undefined => {
  const isNewFlow = !!episodes?.length;

  if (!episode || !seriesPlaylist) return;

  // Using new flow when episodes are available
  if (isNewFlow) {
    const nextEpisode = getNextEpisode(episodes, episode, hasMoreEpisodes, fetchNextEpisodes);

    return nextEpisode;
  }

  // For the old flow we already have all the episodes and seasons so we just need to find them in the array
  const index = seriesPlaylist?.playlist?.findIndex(({ mediaid }) => mediaid === episode.mediaid);

  return seriesPlaylist?.playlist?.[index + 1];
};

/** Get a total amount of episodes in a season */
export const getEpisodesInSeason = (episode: PlaylistItem | undefined, seriesPlaylist: Playlist, series: Series | undefined) => {
  const isNewFlow = !!series;

  if (isNewFlow) {
    return (series?.seasons || []).find((el) => el.season_number === Number(episode?.seasonNumber))?.episode_count;
  }

  return seriesPlaylist.playlist.filter((i) => i.seasonNumber === episode?.seasonNumber)?.length;
};

/** Get episode to redirect to MediaSeriesEpisodePage */
export const getEpisodeToRedirect = (
  episodeId: string | undefined,
  seriesPlaylist: Playlist,
  episodeData: PlaylistItem | undefined,
  episodesData: EpisodesWithPagination[] | undefined,
  isNewSeriesFlow: boolean,
) => {
  if (isNewSeriesFlow) {
    // For the new flow we return either a selected episode (Continue Watching) or just first available one
    return episodeData || episodesData?.[0]?.episodes?.[0];
  }

  // For the old approach we do the same thing, the only thing here that our playlist already have all the episodes inside
  if (!episodeId) {
    return seriesPlaylist.playlist[0];
  }

  return seriesPlaylist.playlist.find(({ mediaid }) => mediaid === episodeId);
};
