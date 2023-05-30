import { useQuery } from 'react-query';

import type { EpisodeMetadata, Series } from '#types/series';
import { getNextItem } from '#src/utils/series';
import { SERIES_CACHE_TIME } from '#src/config';

export const useNextEpisode = ({
  series,
  episodeMetadata,
  episodeId,
}: {
  series: Series | undefined;
  episodeMetadata: EpisodeMetadata | undefined;
  episodeId: string | null;
}) => {
  const { isLoading, data } = useQuery(
    ['next-episode', series?.series_id, episodeId],
    async () => {
      const item = await getNextItem(series, episodeMetadata);

      return item;
    },
    { staleTime: SERIES_CACHE_TIME, cacheTime: SERIES_CACHE_TIME },
  );

  return {
    isLoading,
    data,
  };
};
