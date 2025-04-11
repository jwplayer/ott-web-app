import type { Content } from '@jwp/ott-common/types/config';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';

const DEVICE_FILTER_LABELS = {
  mobile: 'mobile',
  tablet: 'tablet',
  desktop: 'desktop',
};

const useDeviceType = () => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint < Breakpoint.md;
  const isTablet = breakpoint >= Breakpoint.md && breakpoint < Breakpoint.lg;
  const isDesktop = breakpoint >= Breakpoint.lg;

  return { isMobile, isTablet, isDesktop };
};

export const useFilterContent = (content: Content[]) => {
  const { isMobile, isTablet, isDesktop } = useDeviceType();

  const deviceFilterMap = {
    [DEVICE_FILTER_LABELS.mobile]: isMobile,
    [DEVICE_FILTER_LABELS.tablet]: isTablet,
    [DEVICE_FILTER_LABELS.desktop]: isDesktop,
  };

  return content?.filter((item) => Object.entries(deviceFilterMap).every(([label, isActive]) => isActive || !item.filterTags?.includes(label)));
};
