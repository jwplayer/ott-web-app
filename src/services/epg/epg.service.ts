import type { EpgProgram, EpgScheduleType } from '#types/epg';
import type { PlaylistItem } from '#types/playlist';

export default abstract class EpgProviderService {
  readonly type: EpgScheduleType;

  protected constructor(type: EpgScheduleType) {
    this.type = type;
  }

  /**
   * Fetch the schedule data for the given PlaylistItem
   */
  abstract fetchSchedule: (item: PlaylistItem) => Promise<unknown[]>;

  /**
   * Validate the given data with the schema and transform it into an EpgProgram
   */
  abstract transformProgram: (data: unknown) => Promise<EpgProgram>;
}
