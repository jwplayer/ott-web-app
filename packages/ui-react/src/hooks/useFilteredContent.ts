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

const useDeviceType = () => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint < Breakpoint.md;
  const isTablet = breakpoint >= Breakpoint.md && breakpoint < Breakpoint.lg;
  const isDesktop = breakpoint >= Breakpoint.lg;

  return { isMobile, isTablet, isDesktop };
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

export const useFilterContent = (content: Content[]) => {
  const { isMobile, isTablet, isDesktop } = useDeviceType();

  const filteredContentByDevice = filterContentByDevice(content, isMobile, isTablet, isDesktop);
  const filteredContentByWeekDay = filterContentByWeekDay(content);

  return filteredContentByDevice?.filter((item) => filteredContentByWeekDay?.includes(item));
};
