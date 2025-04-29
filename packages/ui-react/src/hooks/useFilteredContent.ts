import type { Content } from '@jwp/ott-common/types/config';
import { Breakpoint, getScreenSize } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';

const DEVICE_FILTER_LABELS = {
  mobile: 'mobile',
  tablet: 'tablet',
  desktop: 'desktop',
};

const COUNTRIES = {
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
  RO: 'Romania',
};

const TIMEZONES = {
  'Europe/Berlin': {
    c: ['DE'],
  },
  'Europe/Paris': {
    c: ['FR'],
  },
  'Europe/Amsterdam': {
    c: ['NL'],
  },
  'Europe/Bucharest': {
    c: ['RO'],
  },
};

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

  const countryCodes = TIMEZONES[timezone as keyof typeof TIMEZONES]?.c;
  if (!countryCodes || countryCodes.length === 0) {
    return undefined;
  }

  const countryCode = countryCodes[0] as keyof typeof COUNTRIES;
  return COUNTRIES[countryCode];
};

const getCurrentDay = () => new Date().toLocaleString('en-US', { weekday: 'long' });

const filterDefaultContent = (item: Content) => !item?.filterTags?.length;

const filterContentByDevice = (item: Content) => {
  const { isMobile, isTablet, isDesktop } = getDeviceType();

  if (item?.filterTags?.includes(DEVICE_FILTER_LABELS.mobile) && isMobile) return true;
  if (item?.filterTags?.includes(DEVICE_FILTER_LABELS.tablet) && isTablet) return true;
  if (item?.filterTags?.includes(DEVICE_FILTER_LABELS.desktop) && isDesktop) return true;
};

const filterContentByWeekDay = (item: Content) => {
  const currentDay = getCurrentDay();
  return item.filterTags?.includes(currentDay);
};

const filterContentByCountry = (item: Content) => {
  const country = getCountryByTimezone();
  return country && item.filterTags?.includes(country);
};

const combineFilters = (filters: ((item: Content) => boolean | string | undefined)[]) => (item: Content) => {
  return filters.some((filter) => filter(item));
};

const filters = [filterDefaultContent, filterContentByDevice, filterContentByWeekDay, filterContentByCountry];

export const useFilterContent = ({ content, labelsFilteringEnabled }: { content: Content[]; labelsFilteringEnabled: boolean }) =>
  labelsFilteringEnabled ? content?.filter(combineFilters(filters)) : content;
