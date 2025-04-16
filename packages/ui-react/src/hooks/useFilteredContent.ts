import type { Content } from '@jwp/ott-common/types/config';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';

const DEVICE_FILTER_LABELS = {
  mobile: 'mobile-device',
  tablet: 'tablet-device',
  desktop: 'desktop-device',
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

const getCurrentDay = () => new Date().toLocaleString('en-US', { weekday: 'long' });

export const useFilterContent = (content: Content[]) => {
  const { isMobile, isTablet, isDesktop } = useDeviceType();
  const currentDay = getCurrentDay();
  const country = getCountryByTimezone();

  return content?.filter((item) => {
    if (item?.filterTags?.length === 0) return true;
    if (item?.filterTags?.includes(DEVICE_FILTER_LABELS.mobile) && isMobile) return true;
    if (item?.filterTags?.includes(DEVICE_FILTER_LABELS.tablet) && isTablet) return true;
    if (item?.filterTags?.includes(DEVICE_FILTER_LABELS.desktop) && isDesktop) return true;
    if (item?.filterTags?.includes(currentDay)) return true;
    if (country && item?.filterTags?.includes(country)) return true;
    return false;
  });
};
