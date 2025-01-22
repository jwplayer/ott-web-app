import { addDays, differenceInDays } from 'date-fns';
import { injectable } from 'inversify';

import EpgService from '../services/EpgService';
import { EPG_TYPE } from '../constants';
import { getNamedModule } from '../modules/container';
import type { PlaylistItem } from '../../types/playlist';
import type { EpgChannel, EpgProgram } from '../../types/epg';
import { logDebug, logError, logWarn } from '../logger';

export const isFulfilled = <T>(input: PromiseSettledResult<T>): input is PromiseFulfilledResult<T> => {
  if (input.status === 'fulfilled') {
    return true;
  }

  logError('EpgController', `An error occurred resolving a promise: `, { error: input.reason });
  return false;
};

@injectable()
export default class EpgController {
  /**
   * Update the start and end time properties of the given programs with the current date.
   * This can be used when having a static schedule or while developing
   */
  private generateDemoPrograms(programs: EpgProgram[]) {
    const today = new Date();
    const startDate = new Date(programs[0]?.startTime);

    // this makes sure that the start of the day is correct. `startOfDay(startDate)` doesn't work since it can yield
    // a different date depending on the timezone.
    // for example, given a startTime of `2022-08-03T23:00:00Z` will parse to `2022-08-04T01:00:00+0200` in
    // Europe/Amsterdam (GMT+2) which makes startOfDay return `2022-08-04T00:00:00+0200`.
    const utcStartDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
    const daysDelta = differenceInDays(today, utcStartDate);

    return programs.map((program, idx) => ({
      ...program,
      id: `${program.id}_${idx}`,
      startTime: addDays(new Date(program.startTime), daysDelta).toJSON(),
      endTime: addDays(new Date(program.endTime), daysDelta).toJSON(),
    }));
  }

  /**
   * Ensure the given data validates to the EpgProgram schema
   */
  parseSchedule = async (data: unknown, item: PlaylistItem) => {
    const demo = !!item.scheduleDemo || false;

    const epgService = this.getEpgService(item);

    if (!Array.isArray(data)) return [];

    const transformResults = await Promise.allSettled(
      data.map((program) =>
        epgService
          ?.transformProgram(program)
          // This quiets promise resolution errors in the console
          .catch((error) => {
            logDebug('EpgController', 'Failed to transform a program', { error, program });
            return undefined;
          }),
      ),
    );

    const programs = transformResults
      .filter(isFulfilled)
      .map((result) => result.value)
      .filter((program): program is EpgProgram => !!program);

    return demo ? this.generateDemoPrograms(programs) : programs;
  };

  /**
   * Fetch and parse the EPG schedule for the given PlaylistItem.
   * When there is no program (empty schedule) or the request fails, it returns a static program.
   */
  getSchedule = async (item: PlaylistItem) => {
    const epgService = this.getEpgService(item);

    const schedule = await epgService?.fetchSchedule(item);
    const programs = await this.parseSchedule(schedule, item);

    const catchupHours = item.catchupHours && parseInt(item.catchupHours);

    return {
      id: item.mediaid,
      title: item.title,
      description: item.description,
      catchupHours: catchupHours || 8,
      channelLogoImage: item.channelLogoImage,
      backgroundImage: item.backgroundImage,
      programs,
    } as EpgChannel;
  };

  getEpgService = (item: PlaylistItem) => {
    const scheduleType = item?.scheduleType?.toLocaleLowerCase() || EPG_TYPE.jwp;
    const service = getNamedModule(EpgService, scheduleType, false);

    if (!service) {
      logWarn('EpgController', `No epg service was added for the ${scheduleType} schedule type`);
    }

    return service;
  };

  /**
   * Get all schedules for the given PlaylistItem's
   */
  getSchedules = async (items: PlaylistItem[]) => {
    return Promise.all(items.map((item) => this.getSchedule(item)));
  };
}
