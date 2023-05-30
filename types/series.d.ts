import type { PlaylistItem } from './playlist';
import type { Pagination } from './pagination';

export type GetSeriesParams = {
  season?: number;
};

export type Episode = {
  episode_number: number;
  season_number: number;
  media_item: PlaylistItem;
};

export type Season = {
  season_id: string;
  season_number: number;
  season_title: string;
  season_description: string;
  episode_count: number;
  total_duration: number;
};

export type EpisodesRes = Pagination & { episodes: Episode[] };

export type EpisodesWithPagination = { episodes: PlaylistItem[]; pagination: Pagination };

export type Series = {
  series_id: string;
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

export type EpisodeMetadata = {
  episodeNumber: string;
  seasonNumber: string;
};
