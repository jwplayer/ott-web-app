export type GetSeriesParams = {
  season?: number;
};

type Episode = {
  media_id: string;
  episode_number: number;
};

type EpisodeWithSeason = {
  media_id: string;
  episode_number: number;
  season_number: number;
};

type Season = {
  season_id: string;
  season_number: number;
  season_title: string;
  season_description: string;
  episode_count: number;
  total_duration: number;
  episodes: Episode[];
};

export type SeriesBase = {
  title: string;
  description: string;
  series_id: string;
  total_duration: string;
  episode_count: number;
};

export type SeriesWithEpisodes = {
  episodes: Episode[];
} & SeriesBase;

export type SeriesWithSeasons = {
  seasons: Season[];
} & SeriesBase;

export type Series = SeriesWithEpisodes | SeriesWithSeasons;
