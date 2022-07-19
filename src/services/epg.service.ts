import { array, object, string } from 'yup';

import type { PlaylistItem } from '#types/playlist';
import { getDataOrThrow } from '#src/utils/api';
import { isValidDateString } from '#src/utils/datetime';
import { logDev } from '#src/utils/common';

export const isFulfilled = <T>(input: PromiseSettledResult<T>): input is PromiseFulfilledResult<T> => input.status === 'fulfilled';

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
      value: string().required(),
    }),
  ),
});

class EpgService {
  async transformProgram(data: unknown) {
    const incomingProgram = await epgProgramSchema.validate(data);
    const transformed: EpgProgram = {
      id: incomingProgram.id,
      title: incomingProgram.title,
      startTime: incomingProgram.startTime,
      endTime: incomingProgram.endTime,
    };

    const customProperties = incomingProgram.chapterPointCustomProperties;

    // map customProperties
    if (customProperties) {
      transformed.image = customProperties.find((item) => item.key === 'image')?.value || '';
      transformed.description = customProperties.find((item) => item.key === 'description')?.value || '';
    }

    return transformed;
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
    if (!item.scheduleUrl) return [];

    const response = await fetch(item.scheduleUrl);

    return getDataOrThrow(response);
  }

  /**
   * Fetch and parse the EPG schedule for the given PlaylistItem.
   * When there is no program (empty schedule) or the request fails, it returns a static program.
   */
  async getSchedule(item: PlaylistItem) {
    let programs: EpgProgram[] = [];

    try {
      const schedule = await this.fetchSchedule(item);
      programs = await this.parseSchedule(schedule);
    } catch (error: unknown) {
      logDev(error);
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
