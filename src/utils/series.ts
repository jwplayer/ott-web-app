import type { Playlist, PlaylistItem } from '#types/playlist';
import type { EpisodeMetadata, EpisodesWithPagination, Series } from '#types/series';
import { getEpisodes, getSeasonWithEpisodes } from '#src/services/api.service';

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
export const filterSeries = (playlist: Playlist, episodes: EpisodesWithPagination[] | undefined, filter: string | undefined): Playlist => {
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

/**
 * Retrieve a first episode of the next season
 */
const getNextSeasonEpisode = async (seasonNumber: number, seriesId: string, series: Series | undefined) => {
  const seasons = series?.seasons;

  // The seasons is the last one in case there is only one season available or it is the same as the last season in the seasons array
  const isLastSeason = seasons?.length === 1 || seasons?.[seasons?.length - 1]?.season_number === seasonNumber;

  if (isLastSeason) {
    return;
  } else {
    // Need to know the order of seasons to choose the next season number
    const hasAscendingOrder = (Number(seasons?.[1]?.season_number) || 0) > (Number(seasons?.[0]?.season_number) || 0);
    const nextSeasonNumber = hasAscendingOrder ? seasonNumber + 1 : seasonNumber - 1;

    return (await getSeasonWithEpisodes(seriesId, nextSeasonNumber, 0, 1))?.episodes?.[0];
  }
};

/**
 * Get a next episode of the selected season / episodes list
 */
const getNextEpisode = async (seasonNumber: number, seriesId: string, pageWithEpisode: number) => {
  if (seasonNumber) {
    return (await getSeasonWithEpisodes(seriesId, seasonNumber, pageWithEpisode, 1))?.episodes?.[0];
  } else {
    return (await getEpisodes(seriesId, pageWithEpisode, 1))?.episodes?.[0];
  }
};

const getNewFlowNextEpisode = async (series: Series | undefined, episodeMetadata: EpisodeMetadata | undefined) => {
  if (!episodeMetadata || !series) {
    return;
  }

  const seasonNumber = Number(episodeMetadata.seasonNumber);
  const episodeNumber = Number(episodeMetadata.episodeNumber);

  // Get initial data to collect information about total number of elements
  const { episodes, pagination } =
    seasonNumber !== 0 ? await getSeasonWithEpisodes(series?.series_id, seasonNumber, 0) : await getEpisodes(series?.series_id, 0);

  if (episodes.length === 1 && seasonNumber) {
    return getNextSeasonEpisode(seasonNumber, series?.series_id, series);
  }

  // Both episodes and seasons can be sorted by asc / desc
  const hasAscendingOrder = (Number(episodes[1].episodeNumber) || 0) > (Number(episodes[0].episodeNumber) || 0);
  const nextEpisodeNumber = hasAscendingOrder ? episodeNumber + 1 : episodeNumber - 1;
  // First page has 0 number, that is why we use Math.floor here
  const pageWithEpisode = Math.floor(hasAscendingOrder ? nextEpisodeNumber : pagination.total - nextEpisodeNumber);
  // Consider the case when we have a next episode in the retrieved list
  const nextElementIndex = episodes.findIndex((el) => Number(el.episodeNumber) === nextEpisodeNumber);

  if (nextElementIndex !== -1) {
    return episodes[nextElementIndex];
  }

  // Fetch the next episodes of the season when there is more to fetch
  if (pageWithEpisode <= pagination.total) {
    return getNextEpisode(seasonNumber, series?.series_id, pageWithEpisode);
    // Switch selected season in case the current one has nor more episodes inside
  } else if (seasonNumber) {
    return getNextSeasonEpisode(seasonNumber, series?.series_id, series);
  }
};

export const getNextItem = async (
  episode: PlaylistItem | undefined,
  seriesPlaylist: Playlist,
  series: Series | undefined,
  episodeMetadata: EpisodeMetadata | undefined,
): Promise<PlaylistItem | undefined> => {
  const isNewFlow = !!series;

  if (!episode || !seriesPlaylist) return;

  // Using new flow when episodes are available
  if (isNewFlow) {
    const nextEpisode = await getNewFlowNextEpisode(series, episodeMetadata);

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
