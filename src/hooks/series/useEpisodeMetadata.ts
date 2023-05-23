import { UseQueryResult, useQuery } from 'react-query';

import { getSeriesByMediaIds } from '#src/services/api.service';
import type { ApiError } from '#src/utils/api';
import type { Series, EpisodeMetadata } from '#types/series';
import type { PlaylistItem } from '#types/playlist';

// Get `episodeNumber` and `seasonNumber` for the new series flow
export const useEpisodeMetadata = (
  episode: PlaylistItem | undefined,
  series: Series | undefined,
  options: { enabled: boolean },
): { isLoading: boolean; data: EpisodeMetadata | undefined } => {
  const { isLoading, data }: UseQueryResult<EpisodeMetadata | undefined, ApiError | null> = useQuery(
    ['episodeId', series?.series_id, episode?.mediaid],
    async () => {
      if (!episode) {
        throw Error('No episode id provided');
      }

      const seriesDictionary = await getSeriesByMediaIds([episode.mediaid]);
      // Get an item details of the associated series (we need its episode and season)
      const { season_number, episode_number } = (seriesDictionary?.[episode.mediaid] || []).find((el) => el.series_id === series?.series_id) || {};

      return { episodeNumber: episode_number && String(episode_number), seasonNumber: season_number && String(season_number) };
    },
    {
      // Only enable this query when having new series flow
      enabled: options.enabled,
    },
  );

  return {
    isLoading,
    data,
  };
};
