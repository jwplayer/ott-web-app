import type { EpisodeMetadata, Series } from '#types/series';
import { getEpisodes, getSeasonWithEpisodes } from '#src/services/api.service';

/**
 * Get an array of options for a season filter
 */
export const getFiltersFromSeries = (series: Series | undefined): { label: string; value: string }[] => {
  return series && 'seasons' in series
    ? series.seasons.map((season) => ({ label: season.season_title || String(season.season_number), value: String(season.season_number) }))
    : [];
};

/**
 * Retrieve a first episode of the next season
 */
const getNextSeasonEpisode = async (seasonNumber: number, series: Series | undefined) => {
  const seasons = series?.seasons;

  // The seasons is the last one in case there is only one season available or it is the same as the last season in the seasons array
  const isLastSeason = seasons?.length === 1 || seasons?.[seasons?.length - 1]?.season_number === seasonNumber;

  if (isLastSeason) {
    return;
  } else {
    // Need to know the order of seasons to choose the next season number
    const hasAscendingOrder = (Number(seasons?.[1]?.season_number) || 0) > (Number(seasons?.[0]?.season_number) || 0);
    const nextSeasonNumber = hasAscendingOrder ? seasonNumber + 1 : seasonNumber - 1;

    return (await getSeasonWithEpisodes(series?.series_id, nextSeasonNumber, 0, 1))?.episodes?.[0];
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

export const getNextItem = async (series: Series | undefined, episodeMetadata: EpisodeMetadata | undefined) => {
  if (!episodeMetadata || !series) {
    return;
  }

  const seasonNumber = Number(episodeMetadata.seasonNumber);
  const episodeNumber = Number(episodeMetadata.episodeNumber);

  // Get initial data to collect information about total number of elements
  const { episodes, pagination } =
    seasonNumber !== 0 ? await getSeasonWithEpisodes(series?.series_id, seasonNumber, 0) : await getEpisodes(series?.series_id, 0);

  if (episodes.length === 1 && seasonNumber) {
    return getNextSeasonEpisode(seasonNumber, series);
  }

  // Both episodes and seasons can be sorted by asc / desc
  const hasAscendingOrder = (Number(episodes[1].episodeNumber) || 0) > (Number(episodes[0].episodeNumber) || 0);
  const nextEpisodeNumber = hasAscendingOrder ? episodeNumber + 1 : episodeNumber - 1;
  // First page has 0 number, that is why we use Math.floor here und subtract 1
  const pageWithEpisode = Math.floor(hasAscendingOrder ? nextEpisodeNumber - 1 : pagination.total - nextEpisodeNumber - 1);
  // Consider the case when we have a next episode in the retrieved list
  const nextElementIndex = episodes.findIndex((el) => Number(el.episodeNumber) === nextEpisodeNumber);

  if (nextElementIndex !== -1) {
    return episodes[nextElementIndex];
  }

  // Fetch the next episodes of the season when there is more to fetch
  if (pageWithEpisode < pagination.total) {
    return getNextEpisode(seasonNumber, series?.series_id, pageWithEpisode);
    // Switch selected season in case the current one has nor more episodes inside
  } else if (seasonNumber) {
    return getNextSeasonEpisode(seasonNumber, series);
  }
};

/** Get a total amount of episodes in a season */
export const getEpisodesInSeason = (episodeMetadata: EpisodeMetadata | undefined, series: Series | undefined) => {
  return (series?.seasons || []).find((el) => el.season_number === Number(episodeMetadata?.seasonNumber))?.episode_count;
};
