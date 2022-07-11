import { useQuery, UseQueryResult } from 'react-query';

import { getSeries, getMediaByIds } from '#src/services/api.service';
import { enrichMediaItems } from '#src/utils/series';
import type { Season, Series } from '#types/series';
import type { Playlist } from '#types/playlist';
import type { ApiError } from '#src/utils/api';

export default (seriesId: string): UseQueryResult<{ series: Series; playlist: Playlist }, ApiError> => {
  return useQuery(
    `series-${seriesId}`,
    async () => {
      const series = await getSeries(seriesId);
      const mediaIds = (series?.seasons || []).flatMap((season: Season) => season.episodes.map((episode) => episode.media_id));
      const mediaItems = await getMediaByIds(mediaIds);

      return {
        series,
        playlist: { title: series?.title, description: series?.description, feedid: series?.series_id, playlist: enrichMediaItems(series, mediaItems) },
      };
    },
    {
      // 8 hours
      staleTime: 60 * 1000 * 60 * 8,
      retry: 2,
      retryDelay: 200,
    },
  );
};
