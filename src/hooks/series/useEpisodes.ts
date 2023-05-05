import { UseInfiniteQueryResult, useInfiniteQuery } from 'react-query';

import { getEpisodes, getSeasonWithEpisodes } from '#src/services/api.service';
import type { EpisodesWithPagination } from '#types/series';
import type { ApiError } from '#src/utils/api';

const CACHE_TIME = 60 * 1000 * 60;

// Get episodes from a selected series using pagination
export const useSeriesEpisodes = (seriesId: string | undefined, isNewSeriesFlow: boolean): UseInfiniteQueryResult<EpisodesWithPagination, ApiError | null> => {
  return useInfiniteQuery(
    [seriesId, 'episodes'],
    async ({ pageParam = 0 }) => {
      const episodes = await getEpisodes(seriesId || '', pageParam);

      return episodes;
    },
    {
      getNextPageParam: (lastPage) => {
        const { page, page_limit, total } = lastPage.pagination;

        // In case there are no more episodes in a season to fetch
        if (page_limit * page >= total) {
          return undefined;
        }

        return page;
      },
      enabled: isNewSeriesFlow,
      // 1 hour
      staleTime: CACHE_TIME,
      cacheTime: CACHE_TIME,
    },
  );
};

// Get episodes from a selected season using pagination
const useSeasonEpisodes = (
  isNewSeriesFlow: boolean,
  seriesId: string | undefined,
  seasonNumber: number,
): UseInfiniteQueryResult<EpisodesWithPagination, ApiError | null> => {
  return useInfiniteQuery(
    [seriesId, 'season', seasonNumber],
    async ({ pageParam = 0 }) => {
      const season = await getSeasonWithEpisodes(seriesId || '', seasonNumber, pageParam);

      return { pagination: season.pagination, episodes: season.episodes };
    },
    {
      getNextPageParam: (lastPage) => {
        const { page, page_limit, total } = lastPage.pagination;

        // In case there are no more episodes in a season to fetch
        if (page_limit * page >= total) {
          return undefined;
        }

        return page;
      },
      enabled: isNewSeriesFlow,
      // 1 hour
      staleTime: CACHE_TIME,
      cacheTime: CACHE_TIME,
    },
  );
};

export const useEpisodes = (
  seriesId: string | undefined,
  isNewSeriesFlow: boolean,
  filter: string | undefined,
): { data: EpisodesWithPagination[]; hasNextPage: boolean; fetchNextPage: () => void } => {
  const {
    data: episodesData,
    fetchNextPage: fetchNextSeriesEpisodes,
    hasNextPage: hasNextEpisodesPage = false,
  } = useSeriesEpisodes(seriesId, isNewSeriesFlow && !filter);

  const {
    data: seasonEpisodesData,
    fetchNextPage: fetchNextSeasonEpisodes,
    hasNextPage: hasNextSeasonEpisodesPage = false,
  } = useSeasonEpisodes(isNewSeriesFlow && !!filter, seriesId, Number(filter));

  if (!filter) {
    return { data: episodesData?.pages || [], fetchNextPage: fetchNextSeriesEpisodes, hasNextPage: hasNextEpisodesPage };
  }

  return {
    data: seasonEpisodesData?.pages || [],
    fetchNextPage: fetchNextSeasonEpisodes,
    hasNextPage: hasNextSeasonEpisodesPage,
  };
};
