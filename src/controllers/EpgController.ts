import { inject, injectable } from 'inversify';

import type { PlaylistItem } from '#types/playlist';
import type EpgService from '#src/services/epg/epg.service';
import { SERVICES } from '#src/ioc/types';

@injectable()
export default class EpgController {
  private epgService: EpgService;

  constructor(@inject(SERVICES.EPG) epgService: EpgService) {
    this.epgService = epgService;
  }

  async getSchedules(items: PlaylistItem[]) {
    return this.epgService.getSchedules(items);
  }
}
