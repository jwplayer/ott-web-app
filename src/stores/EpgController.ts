import { injectable } from 'inversify';

import type { PlaylistItem } from '#types/playlist';
import EpgService from '#src/services/epg.service';

@injectable()
export default class EpgController {
  private readonly epgService: EpgService;

  constructor(epgService: EpgService) {
    this.epgService = epgService;
  }

  getSchedules = async (items: PlaylistItem[]) => {
    return this.epgService.getSchedules(items);
  };
}
