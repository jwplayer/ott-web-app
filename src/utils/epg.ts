import { isAfter, isFuture, isPast, subHours } from 'date-fns';

import type { EpgChannel, EpgProgram } from '#src/services/epg.service';

/**
 * Returns true when the program is currently live e.g. the startTime is before now and the endTime is after now
 */
export const programIsLive = (program: EpgProgram) => {
  const startTime = new Date(program.startTime);
  const endTime = new Date(program.endTime);

  return isPast(startTime) && isFuture(endTime);
};

/**
 * Returns true when the program is finished.
 */
export const programIsVod = (program: EpgProgram) => {
  const endTime = new Date(program.endTime);

  return isPast(endTime);
};

/**
 * Returns true when the program is watchable from the beginning. This is when the startTime is within the live stream
 * archive length.
 */
export const programIsFullyWatchable = (program: EpgProgram, liveStreamCatchupHours = 8) => {
  const startTime = new Date(program.startTime);
  const maxStartTime = subHours(new Date(), liveStreamCatchupHours);

  return isAfter(startTime, maxStartTime);
};

/**
 * Get the live program of the given channel
 */
export const getLiveProgram = (channel: EpgChannel) => {
  return channel.programs.find(programIsLive);
};
