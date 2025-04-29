import type { Content } from '@jwp/ott-common/types/config';
import { Breakpoint, getScreenSize } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';

const DEVICE_FILTER_LABELS: Record<string, string> = {
  mobile: 'mobile',
  tablet: 'tablet',
  desktop: 'desktop',
} as const;

const COUNTRIES: Record<string, string> = {
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
  RO: 'Romania',
} as const;

const TIMEZONES: Record<string, string> = {
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR',
  'Europe/Amsterdam': 'NL',
  'Europe/Bucharest': 'RO',
} as const;

const getDeviceType = () => {
  const breakpoint = getScreenSize();
  const isMobile = breakpoint < Breakpoint.md;
  const isTablet = breakpoint >= Breakpoint.md && breakpoint < Breakpoint.lg;
  const isDesktop = breakpoint >= Breakpoint.lg;

  return { isMobile, isTablet, isDesktop };
};

const getCountryByTimezone = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!timezone || !(timezone in TIMEZONES)) {
    return undefined;
  }

  return COUNTRIES[TIMEZONES[timezone]];
};

const getCurrentDay = () => new Date().toLocaleString('en-US', { weekday: 'long' });

const filterDefaultContent = (item: Content) => !item?.filterTags?.length;

const filterContentByDevice = (item: Content) => {
  const { isMobile, isTablet, isDesktop } = getDeviceType();

  const filterTags = item?.filterTags?.split(',') || [];

  if (filterTags.includes(DEVICE_FILTER_LABELS.mobile) && isMobile) return true;
  if (filterTags.includes(DEVICE_FILTER_LABELS.tablet) && isTablet) return true;
  if (filterTags.includes(DEVICE_FILTER_LABELS.desktop) && isDesktop) return true;
};

const filterContentByWeekDay = (item: Content) => {
  const currentDay = getCurrentDay();
  const filterTags = item?.filterTags?.split(',') || [];

  return filterTags.includes(currentDay);
};

const filterContentByCountry = (item: Content) => {
  const country = getCountryByTimezone();
  const filterTags = item?.filterTags?.split(',') || [];

  return country && filterTags.includes(country);
};

const combineFilters = (filters: ((item: Content) => boolean | string | undefined)[]) => (item: Content) => {
  return filters.some((filter) => filter(item));
};

const filters = [filterDefaultContent, filterContentByDevice, filterContentByWeekDay, filterContentByCountry];

export const useFilterContent = ({ content, labelsFilteringEnabled }: { content: Content[]; labelsFilteringEnabled: boolean }) =>
  labelsFilteringEnabled ? content?.filter(combineFilters(filters)) : content;
