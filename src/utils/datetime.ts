/**
 * Seconds to ISO8601 duration or date string
 * TODO: use date-fns to replace this util
 */
export function secondsToISO8601(input: number, timeOnly: boolean = false): string {
  if (!input) {
    return '';
  }

  const date = new Date(input ? input * 1000 : 0);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();

  if (!timeOnly) {
    return date.toISOString();
  }

  let isoString = 'PT';
  if (hours > 0) isoString += hours + 'H';
  if (minutes > 0) isoString += minutes + 'M';
  if (seconds > 0) isoString += seconds + 'S';

  return isoString;
}

export const is12HourClock = () => {
  const date = new Date(Date.UTC(2022, 6, 20, 18, 0, 0));
  return /am|pm/.test(date.toLocaleTimeString());
};
