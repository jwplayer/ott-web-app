import { array, object, string } from 'yup';

import type { PlaylistItem } from '#types/playlist';
import { getDataOrThrow } from '#src/utils/api';
import { addDays, endOfDay, isValidDateString, startOfDay, subDays } from '#src/utils/datetime';
import { logDev } from '#src/utils/common';
import i18n from '#src/i18n/config';

const AUTHENTICATION_HEADER = 'API-KEY';

export const isFulfilled = <T>(input: PromiseSettledResult<T>): input is PromiseFulfilledResult<T> => {
  if (input.status === 'fulfilled') {
    return true;
  }

  logDev(`An error occurred resolving a promise: `, input.reason);
  return false;
};

export type EpgChannel = {
  title: string;
  image: string;
  programs: EpgProgram[];
};

export type EpgProgram = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  image?: string;
};

const epgProgramSchema = object().shape({
  id: string().required(),
  title: string().required(),
  startTime: string()
    .required()
    .test((value) => (value ? isValidDateString(value) : false)),
  endTime: string()
    .required()
    .test((value) => (value ? isValidDateString(value) : false)),
  chapterPointCustomProperties: array().of(
    object().shape({
      key: string().required(),
      value: string().test('required-but-empty', 'value is required', (value: unknown) => typeof value === 'string'),
    }),
  ),
});

class EpgService {
  /**
   * Generate a static EpgProgram which is used to fill the schedule when empty.
   */
  generateStaticProgram({ id, title, description }: { id: string; title: string; description: string }): EpgProgram {
    return {
      id,
      title,
      description,
      startTime: subDays(startOfDay(), 1).toJSON(),
      endTime: addDays(endOfDay(), 1).toJSON(),
      image: undefined,
    };
  }

  /**
   * Validate the given data with the epgProgramSchema and transform it into an EpgProgram
   */
  async transformProgram(data: unknown): Promise<EpgProgram> {
    const program = await epgProgramSchema.validate(data);

    return {
      id: program.id,
      title: program.title,
      startTime: program.startTime,
      endTime: program.endTime,
      image: program.chapterPointCustomProperties?.find((item) => item.key === 'image')?.value || undefined,
      description: program.chapterPointCustomProperties?.find((item) => item.key === 'description')?.value || undefined,
    };
  }

  /**
   * Ensure the given data validates to the EpgProgram schema
   */
  async parseSchedule(data: unknown) {
    if (!Array.isArray(data)) return [];

    const transformResults = await Promise.allSettled(data.map((program) => this.transformProgram(program)));

    return transformResults.filter(isFulfilled).map((result) => result.value);
  }

  /**
   * Fetch the schedule data for the given PlaylistItem
   */
  async fetchSchedule(item: PlaylistItem) {
    if (!item.scheduleUrl) {
      logDev('Tried requesting a schedule for an item with missing `scheduleUrl`', item);
      return undefined;
    }

    const headers = new Headers();

    // add authentication token when `scheduleToken` is defined
    if (item.scheduleToken) {
      headers.set(AUTHENTICATION_HEADER, item.scheduleToken);
    }

    try {
      const response = await fetch(item.scheduleUrl, {
        headers,
      });

      // await needed to ensure the error is caught here
      return await getDataOrThrow(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logDev(`Fetch failed for EPG schedule: '${item.scheduleUrl}'`, error);
      }
    }
  }

  /**
   * Fetch and parse the EPG schedule for the given PlaylistItem.
   * When there is no program (empty schedule) or the request fails, it returns a static program.
   */
  async getSchedule(item: PlaylistItem) {
    const schedule = await this.fetchSchedule(item);
    let programs = await this.parseSchedule(schedule);

    if (!programs.length) {
      programs = [
        this.generateStaticProgram({
          id: `no-program-${item.mediaid}`,
          title: schedule ? i18n.t('epg:empty_schedule_program.title') : i18n.t('epg:failed_schedule_program.title'),
          description: schedule ? i18n.t('epg:empty_schedule_program.description') : i18n.t('epg:failed_schedule_program.description'),
        }),
      ];
    }

    return {
      title: item.title,
      programs,
    } as EpgChannel;
  }

  /**
   * Get all schedules for the given PlaylistItem's
   */
  async getSchedules(items: PlaylistItem[]) {
    return Promise.all(items.map((item) => this.getSchedule(item)));
  }
}

// TODO: currently exported as singleton, the initialisation should be moved to a Service registry when this is added
export default new EpgService();
