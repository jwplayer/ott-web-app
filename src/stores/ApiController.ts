import { injectable } from 'inversify';

import type { GetPlaylistParams, Playlist, PlaylistItem } from '#types/playlist';
import type { AdSchedule } from '#types/ad-schedule';
import type { EpisodeInSeries, EpisodesWithPagination, GetSeriesParams, Series } from '#types/series';
import ApiService from '#src/services/api.service';

@injectable()
export default class EpgController {
  private readonly apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  getPlaylistById = async (id?: string, params: GetPlaylistParams = {}): Promise<Playlist | undefined> => {
    return this.apiService.getPlaylistById(id, params);
  };

  getMediaByWatchlist = async (playlistId: string, mediaIds: string[], token?: string): Promise<PlaylistItem[] | undefined> => {
    return this.apiService.getMediaByWatchlist(playlistId, mediaIds, token);
  };

  getMediaById = async (id: string, token?: string, drmPolicyId?: string): Promise<PlaylistItem | undefined> => {
    return this.apiService.getMediaById(id, token, drmPolicyId);
  };

  getSeries = async (id: string, params: GetSeriesParams = {}): Promise<Series | undefined> => {
    return this.apiService.getSeries(id, params);
  };

  getSeriesByMediaIds = async (mediaIds: string[]): Promise<{ [mediaId: string]: EpisodeInSeries[] | undefined } | undefined> => {
    return this.apiService.getSeriesByMediaIds(mediaIds);
  };

  getEpisodes = async (args: { seriesId: string | undefined; pageOffset?: number; pageLimit?: number; afterId?: string }): Promise<EpisodesWithPagination> => {
    return this.apiService.getEpisodes(args);
  };

  getSeasonWithEpisodes = async (args: {
    seriesId: string | undefined;
    seasonNumber: number;
    pageOffset?: number;
    pageLimit?: number;
  }): Promise<EpisodesWithPagination> => {
    return this.apiService.getSeasonWithEpisodes(args);
  };

  getAdSchedule = async (id: string | undefined | null): Promise<AdSchedule | undefined> => {
    return this.apiService.getAdSchedule(id);
  };
}
