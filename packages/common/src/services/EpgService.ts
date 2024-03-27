import type { EpgProgram } from '../../types/epg';
import type { PlaylistItem } from '../../types/playlist';

export default abstract class EpgService {
  /**
   * Fetch the schedule data for the given PlaylistItem
   */
  abstract fetchSchedule: (item: PlaylistItem) => Promise<unknown>;

  /**
   * Validate the given data with the schema and transform it into an EpgProgram
   */
  abstract transformProgram: (data: unknown) => Promise<EpgProgram>;
}
