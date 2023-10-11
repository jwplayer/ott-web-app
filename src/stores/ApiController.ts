import { inject, injectable } from 'inversify';

import type { GetPlaylistParams, Playlist, PlaylistItem } from '#types/playlist';
import { SERVICES } from '#src/ioc/types';
import type ApiService from '#src/services/api.service';
import type { AdSchedule } from '#types/ad-schedule';
import type { EpisodeInSeries, EpisodesWithPagination, GetSeriesParams, Series } from '#types/series';

@injectable()
export default class EpgController {
  private apiService: ApiService;

  constructor(@inject(SERVICES.Api) apiService: ApiService) {
    this.apiService = apiService;
  }

  async getPlaylistById(id?: string, params: GetPlaylistParams = {}): Promise<Playlist | undefined> {
    return this.apiService.getPlaylistById(id, params);
  }

  async getMediaByWatchlist(playlistId: string, mediaIds: string[], token?: string): Promise<PlaylistItem[] | undefined> {
    return this.apiService.getMediaByWatchlist(playlistId, mediaIds, token);
  }

  async getMediaById(id: string, token?: string, drmPolicyId?: string): Promise<PlaylistItem | undefined> {
    return this.apiService.getMediaById(id, token, drmPolicyId);
  }

  async getSeries(id: string, params: GetSeriesParams = {}): Promise<Series | undefined> {
    return this.apiService.getSeries(id, params);
  }

  async getSeriesByMediaIds(mediaIds: string[]): Promise<{ [mediaId: string]: EpisodeInSeries[] | undefined } | undefined> {
    return this.apiService.getSeriesByMediaIds(mediaIds);
  }

  async getEpisodes(args: { seriesId: string | undefined; pageOffset?: number; pageLimit?: number; afterId?: string }): Promise<EpisodesWithPagination> {
    return this.apiService.getEpisodes(args);
  }

  async getSeasonWithEpisodes(args: {
    seriesId: string | undefined;
    seasonNumber: number;
    pageOffset?: number;
    pageLimit?: number;
  }): Promise<EpisodesWithPagination> {
    return this.apiService.getSeasonWithEpisodes(args);
  }

  async getAdSchedule(id: string | undefined | null): Promise<AdSchedule | undefined> {
    return this.apiService.getAdSchedule(id);
  }
}
