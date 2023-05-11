import { useInfiniteQuery } from 'react-query';

import { getEpisodes, getSeasonWithEpisodes } from '#src/services/api.service';
import type { EpisodesWithPagination } from '#types/series';
import type { Pagination } from '#types/pagination';

// 1 hour
const CACHE_TIME = 60 * 1000 * 60;

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
        const season = await getSeasonWithEpisodes(seriesId || '', Number(seasonNumber), pageParam);

        return { pagination: season.pagination, episodes: season.episodes };
      } else {
        // Get episodes from a selected series using pagination
        const data = await getEpisodes(seriesId || '', pageParam);
        return data;
      }
    },
    {
      getNextPageParam: (lastPage) => getNextPageParam(lastPage?.pagination),
      enabled: options.enabled,
      staleTime: CACHE_TIME,
      cacheTime: CACHE_TIME,
    },
  );

  return {
    data: data?.pages || [],
    isLoading,
    fetchNextPage,
    hasNextPage,
  };
};
