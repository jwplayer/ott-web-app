import type { Content } from '@jwp/ott-common/types/config';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';

const DEVICE_FILTER_LABELS = {
  mobile: 'mobile-device',
  tablet: 'tablet-device',
  desktop: 'desktop-device',
};

const WEEK_DAY_FILTER_LABELS = {
  Monday: 'Monday',
  Tuesday: 'Tuesday',
  Wednesday: 'Wednesday',
  Thursday: 'Thursday',
  Friday: 'Friday',
  Saturday: 'Saturday',
  Sunday: 'Sunday',
};

const COUNTRIES = {
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
  RO: 'Romania',
};

const TIMEZONES = {
  'Europe/Berlin': {
    u: 60,
    d: 120,
    c: ['DE'],
  },
  'Europe/Paris': {
    u: 60,
    d: 120,
    c: ['FR'],
  },
  'Europe/Amsterdam': {
    u: 60,
    d: 120,
    c: ['NL'],
  },
  'Europe/Bucharest': {
    u: 120,
    d: 180,
    c: ['RO'],
  },
};

const useDeviceType = () => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint < Breakpoint.md;
  const isTablet = breakpoint >= Breakpoint.md && breakpoint < Breakpoint.lg;
  const isDesktop = breakpoint >= Breakpoint.lg;

  return { isMobile, isTablet, isDesktop };
};

const getCountryByTimezone = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!timezone) {
    return undefined;
  }

  const countryTimezone = TIMEZONES[timezone as keyof typeof TIMEZONES]?.c[0] as keyof typeof COUNTRIES;
  return countryTimezone ? COUNTRIES[countryTimezone] : undefined;
};

const filterContentByDevice = (content: Content[], isMobile: boolean, isTablet: boolean, isDesktop: boolean) => {
  const deviceFilterMap = {
    [DEVICE_FILTER_LABELS.mobile]: isMobile,
    [DEVICE_FILTER_LABELS.tablet]: isTablet,
    [DEVICE_FILTER_LABELS.desktop]: isDesktop,
  };

  return content?.filter((item) => Object.entries(deviceFilterMap).every(([label, isActive]) => isActive || !item.filterTags?.includes(label)));
};

const filterContentByWeekDay = (content: Content[]) => {
  const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' });

  const weekDayFilterMap = {
    [WEEK_DAY_FILTER_LABELS.Monday]: currentDay === WEEK_DAY_FILTER_LABELS.Monday,
    [WEEK_DAY_FILTER_LABELS.Tuesday]: currentDay === WEEK_DAY_FILTER_LABELS.Tuesday,
    [WEEK_DAY_FILTER_LABELS.Wednesday]: currentDay === WEEK_DAY_FILTER_LABELS.Wednesday,
    [WEEK_DAY_FILTER_LABELS.Thursday]: currentDay === WEEK_DAY_FILTER_LABELS.Thursday,
    [WEEK_DAY_FILTER_LABELS.Friday]: currentDay === WEEK_DAY_FILTER_LABELS.Friday,
    [WEEK_DAY_FILTER_LABELS.Saturday]: currentDay === WEEK_DAY_FILTER_LABELS.Saturday,
    [WEEK_DAY_FILTER_LABELS.Sunday]: currentDay === WEEK_DAY_FILTER_LABELS.Sunday,
  };

  return content?.filter((item) => Object.entries(weekDayFilterMap).every(([label, isActive]) => isActive || !item.filterTags?.includes(label)));
};

const filterContentByCountry = (content: Content[]) => {
  const country = getCountryByTimezone();

  if (!country) return content;

  const countryFilterMap = {
    [COUNTRIES.DE]: country === COUNTRIES.DE,
    [COUNTRIES.FR]: country === COUNTRIES.FR,
    [COUNTRIES.NL]: country === COUNTRIES.NL,
    [COUNTRIES.RO]: country === COUNTRIES.RO,
  };

  return content?.filter((item) => Object.entries(countryFilterMap).every(([label, isActive]) => isActive || !item.filterTags?.includes(label)));
};

export const useFilterContent = (content: Content[]) => {
  const { isMobile, isTablet, isDesktop } = useDeviceType();

  const filteredContentByDevice = filterContentByDevice(content, isMobile, isTablet, isDesktop);
  const filteredContentByWeekDay = filterContentByWeekDay(content);
  const filteredContentByCountry = filterContentByCountry(content);

  return filteredContentByDevice.filter((item) => filteredContentByWeekDay.includes(item) && filteredContentByCountry.includes(item));
};
