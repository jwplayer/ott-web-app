import type { PlaylistItem } from './playlist';
import type { Pagination } from './pagination';

export type GetSeriesParams = {
  season?: number;
};

type Sort = 'asc' | 'dsc';

export type Episode = {
  episode_number: number;
  season_number: number;
  media_item: PlaylistItem;
};

export type Season<T> = {
  season_id: string;
  season_number: number;
  season_title: string;
  season_description: string;
  episode_count: number;
  total_duration: number;
  episodes: T[];
};

export type EpisodesRes = Pagination & { episodes: Episode[] };

export type SeasonsRes = Pagination & { seasons: Season<Episode>[] };

export type SeasonWithPagination = Season<PlaylistItem> & { pagination: Pagination };

export type EpisodesWithPagination = { episodes: PlaylistItem[]; pagination: Pagination };

export type Series = {
  series_id: string;
  total_duration: string;
  episode_count: number;
  season_count: number;
  total_duration: number;
  seasons: Season[];
};

export type EpisodeInSeries = {
  series_id: string;
  episode_number: number;
  season_number: number;
};
