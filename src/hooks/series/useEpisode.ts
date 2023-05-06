import { UseQueryResult, useQuery } from 'react-query';

import useMedia from '../useMedia';

import { getSeriesByMediaIds } from '#src/services/api.service';
import type { ApiError } from '#src/utils/api';
import type { PlaylistItem } from '#types/playlist';
import type { Series } from '#types/series';

// Get an episode by id and enrich it with `episodeNumber` and `seasonNumber` for the new series flow
export const useEpisode = (episodeId: string | undefined, series: Series | undefined): { isLoading: boolean; data: PlaylistItem | undefined } => {
  // Cache lets us reuse the data
  const { data: media, isLoading: isMediaLoading } = useMedia(episodeId || '', !!episodeId);

  const { isLoading: isEpisodeLoading, data: enrichedMedia }: UseQueryResult<PlaylistItem | undefined, ApiError | null> = useQuery(
    ['episodeId', episodeId],
    async () => {
      if (!episodeId) {
        throw Error('No episode id provided');
      }
      const seriesDictionary = await getSeriesByMediaIds([episodeId]);
      // Get an item details of the associated series (we need its episode and season)
      const { season_number, episode_number } = (seriesDictionary?.[episodeId] || []).find((el) => el.series_id === series?.series_id) || {};
      // Add seriesId to work with watch history
      return { ...media, episodeNumber: String(episode_number || 0), seasonNumber: String(season_number || 0), seriesId: series?.series_id };
    },
    {
      // Only enable this query when having new series flow
      enabled: !!(series && media && episodeId),
    },
  );

  return {
    isLoading: isEpisodeLoading || isMediaLoading,
    data: series ? enrichedMedia : media,
  };
};
