import { useInfiniteQuery } from 'react-query';

import { getEpisodes, getSeasonWithEpisodes } from '#src/services/api.service';
import type { EpisodesWithPagination } from '#types/series';
import type { Pagination } from '#types/pagination';
import { SERIES_CACHE_TIME } from '#src/config';

const getNextPageParam = (pagination: Pagination) => {
  const { page, page_limit, total } = pagination;

  // In case there are no more episodes in a season to fetch
  if (page_limit * page >= total) {
    return undefined;
  }

  return page;
};

export const useEpisodes = (
  seriesId: string | undefined,
  seasonNumber: string | undefined,
  options: { enabled: boolean },
): {
  data: EpisodesWithPagination[];
  hasNextPage: boolean;
  fetchNextPage: (params?: { pageParam?: number }) => void;
  isLoading: boolean;
} => {
  const {
    data,
    fetchNextPage,
    isLoading,
    hasNextPage = false,
  } = useInfiniteQuery(
    [seriesId, seasonNumber],
    async ({ pageParam = 0 }) => {
      if (Number(seasonNumber)) {
        // Get episodes from a selected season using pagination
        const season = await getSeasonWithEpisodes({ seriesId, seasonNumber: Number(seasonNumber), pageOffset: pageParam });

        return { pagination: season.pagination, episodes: season.episodes };
      } else {
        // Get episodes from a selected series using pagination
        const data = await getEpisodes({ seriesId, pageOffset: pageParam });
        return data;
      }
    },
    {
      getNextPageParam: (lastPage) => getNextPageParam(lastPage?.pagination),
      enabled: options.enabled,
      staleTime: SERIES_CACHE_TIME,
      cacheTime: SERIES_CACHE_TIME,
    },
  );

  return {
    data: data?.pages || [],
    isLoading,
    fetchNextPage,
    hasNextPage,
  };
};
