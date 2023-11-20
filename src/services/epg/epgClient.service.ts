import { addDays, differenceInDays } from 'date-fns';
import { injectable, targetName } from 'inversify';

import EpgProviderService from './epgProvider.service';

import { logDev } from '#src/utils/common';
import { EPG_TYPE } from '#src/config';
import type { PlaylistItem } from '#types/playlist';
import type { EpgProgram, EpgChannel } from '#types/epg';

export const isFulfilled = <T>(input: PromiseSettledResult<T>): input is PromiseFulfilledResult<T> => {
  if (input.status === 'fulfilled') {
    return true;
  }

  logDev(`An error occurred resolving a promise: `, input.reason);
  return false;
};

@injectable()
export default class EpgClientService {
  private viewNexaProvider: EpgProviderService;
  private jwProvider: EpgProviderService;

  public constructor(@targetName(EPG_TYPE.JW) jwProvider: EpgProviderService, @targetName(EPG_TYPE.VIEW_NEXA) viewNexaProvider: EpgProviderService) {
    this.viewNexaProvider = viewNexaProvider;
    this.jwProvider = jwProvider;
  }

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

    return programs.map((program) => ({
      ...program,
      startTime: addDays(new Date(program.startTime), daysDelta).toJSON(),
      endTime: addDays(new Date(program.endTime), daysDelta).toJSON(),
    }));
  }

  /**
   * Ensure the given data validates to the EpgProgram schema
   */
  parseSchedule = async (data: unknown, item: PlaylistItem) => {
    const demo = !!item.scheduleDemo || false;

    const epgService = this.getScheduleProvider(item);

    if (!Array.isArray(data)) return [];

    const transformResults = await Promise.allSettled(
      data.map((program) =>
        epgService
          .transformProgram(program)
          // This quiets promise resolution errors in the console
          .catch((error) => {
            logDev(error);
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
    const epgService = this.getScheduleProvider(item);

    const schedule = await epgService.fetchSchedule(item);
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

  getScheduleProvider = (item: PlaylistItem) => {
    return item?.scheduleType === EPG_TYPE.VIEW_NEXA ? this.viewNexaProvider : this.jwProvider;
  };

  /**
   * Get all schedules for the given PlaylistItem's
   */
  getSchedules = async (items: PlaylistItem[]) => {
    return Promise.all(items.map((item) => this.getSchedule(item)));
  };
}
