import type { EpisodeMetadata, Series } from '#types/series';

/**
 * Get an array of options for a season filter
 */
export const getFiltersFromSeries = (series: Series | undefined): { label: string; value: string }[] => {
  return series && 'seasons' in series
    ? series.seasons.map((season) => ({ label: season.season_title || String(season.season_number), value: String(season.season_number) }))
    : [];
};

/** Get a total amount of episodes in a season */
export const getEpisodesInSeason = (episodeMetadata: EpisodeMetadata | undefined, series: Series | undefined) => {
  return (series?.seasons || []).find((el) => el.season_number === Number(episodeMetadata?.seasonNumber))?.episode_count;
};
