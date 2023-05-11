import { UseQueryResult, useQuery } from 'react-query';

import { getSeriesByMediaIds } from '#src/services/api.service';
import type { ApiError } from '#src/utils/api';
import type { Series, EpisodeMetadata } from '#types/series';
import type { PlaylistItem } from '#types/playlist';

// Get `episodeNumber` and `seasonNumber` for the new series flow
export const useEpisodeMetadata = (
  episode: PlaylistItem,
  series: Series | undefined,
  options: { enabled: boolean },
): { isLoading: boolean; data: EpisodeMetadata | undefined } => {
  const oldFlowMetadata = { episodeNumber: episode?.episodeNumber || '0', seasonNumber: episode?.seasonNumber || '0' };

  const { isLoading, data }: UseQueryResult<EpisodeMetadata | undefined, ApiError | null> = useQuery(
    ['episodeId', episode.mediaid],
    async () => {
      if (!episode.mediaid) {
        throw Error('No episode id provided');
      }

      const seriesDictionary = await getSeriesByMediaIds([episode.mediaid]);
      // Get an item details of the associated series (we need its episode and season)
      const { season_number, episode_number } = (seriesDictionary?.[episode.mediaid] || []).find((el) => el.series_id === series?.series_id) || {};
      // Add seriesId to work with watch history
      return { episodeNumber: String(episode_number || 0), seasonNumber: String(season_number || 0), seriesId: series?.series_id };
    },
    {
      // Only enable this query when having new series flow
      enabled: options.enabled,
    },
  );

  return {
    isLoading,
    data: isLoading || !options.enabled ? data : series ? data : oldFlowMetadata,
  };
};
