import { useQuery, UseQueryResult } from 'react-query';

import { getSeries, getMediaByIds } from '#src/services/api.service';
import type { EpisodeWithSeason, Season, Series } from '#types/series';
import type { Playlist, PlaylistItem } from '#types/playlist';
import type { ApiError } from '#src/utils/api';

/** We need to add episodeNumber and seasonNumber to each media item we got
 *  That will help with further data retrieval
 */
const enrichMediaItems = (series: Series | undefined, mediaItems: PlaylistItem[] | undefined): PlaylistItem[] => {
  const episodes = (series?.seasons || []).flatMap((season: Season) => season.episodes.map((episode) => ({ ...episode, season_number: season.season_number })));

  const itemsWithEpisodes = (mediaItems || []).map((item) => {
    const episode = episodes.find((episode) => episode.media_id === item.mediaid) as EpisodeWithSeason;

    return { ...item, seasonNumber: String(episode.season_number), episodeNumber: String(episode.episode_number) };
  });

  return itemsWithEpisodes;
};

export default (seriesId: string): UseQueryResult<{ series: Series; playlist: Playlist }, ApiError> => {
  return useQuery(
    `series-${seriesId}`,
    async () => {
      const data = await getSeries(seriesId).then(async (series) => {
        const mediaIds = (series?.seasons || []).flatMap((season: Season) => season.episodes.map((episode) => episode.media_id));
        const mediaItems = await getMediaByIds(mediaIds);

        return {
          series,
          playlist: { title: series?.title, description: series?.description, feedid: series?.series_id, playlist: enrichMediaItems(series, mediaItems) },
        };
      });

      return data;
    },
    {
      // 8 hours
      staleTime: 60 * 1000 * 60 * 8,
      retry: 0,
    },
  );
};
