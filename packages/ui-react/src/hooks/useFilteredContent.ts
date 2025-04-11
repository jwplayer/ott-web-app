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

const useFilterContentByDevice = (content: Content[]) => {
  const { isMobile, isTablet, isDesktop } = useDeviceType();

  return content?.filter((item) => {
    if (!isMobile) return !item.filterTags?.includes(DEVICE_FILTER_LABELS.mobile);
    if (!isTablet) return !item.filterTags?.includes(DEVICE_FILTER_LABELS.tablet);
    if (!isDesktop) return !item.filterTags?.includes(DEVICE_FILTER_LABELS.desktop);

    return true;
  });
};

export const useFilteredContent = (content: Content[]) => [...useFilterContentByDevice(content)];
