import { useQuery, UseQueryResult } from 'react-query';

import { getSeries } from '#src/services/series.service';
import { getMediaByWatchlist } from '#src/services/api.service';
import { enrichMediaItems } from '#src/utils/series';
import type { Season, Series } from '#types/series';
import type { PlaylistItem } from '#types/playlist';
import type { ApiError } from '#src/utils/api';

export const useSeriesData = (id: string, season?: number): UseQueryResult<Series | undefined, ApiError> =>
  useQuery(`series-${id}`, async () => getSeries(id, { season }), {
    staleTime: Infinity,
    retry: 0,
  });

export const useSeriesMediaItems = (
  seriesId: string,
  watchlistId: string | null | undefined,
): UseQueryResult<{ mediaItems: PlaylistItem[]; series: Series }, ApiError> =>
  useQuery(
    `series-watchlist-${seriesId}`,
    async () => {
      if (!watchlistId) {
        throw Error('Please set features.favoritesList property');
      }

      const series = await getSeries(seriesId);
      const mediaIds = (series?.seasons || []).reduce((acc: string[], season: Season) => {
        const ids = season.episodes.map((el) => el.media_id);
        return [...acc, ...ids];
      }, []);

      const mediaItems = await getMediaByWatchlist(watchlistId, mediaIds);

      return { series, mediaItems: enrichMediaItems(series, mediaItems) };
    },
    {
      staleTime: Infinity,
      retry: 0,
    },
  );
