import type { Content } from '@jwp/ott-common/types/config';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';

const DEVICE_FILTER_LABELS = {
  mobile: 'mobile',
  tablet: 'tablet',
  desktop: 'desktop',
};

const COUNTRY_FILTER_LABELS = {
  nl: 'NL',
  usa: 'USA',
  ca: 'CA',
};

const GENRE_FILTER_LABELS = {
  comedy: 'comedy',
  drama: 'drama',
  action: 'action',
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
    if (isMobile && item.filterTags?.includes(DEVICE_FILTER_LABELS.mobile)) return true;
    if (isTablet && item.filterTags?.includes(DEVICE_FILTER_LABELS.tablet)) return true;
    if (isDesktop && item.filterTags?.includes(DEVICE_FILTER_LABELS.desktop)) return true;
    return true;
  });
};

const filterContentByCountry = (content: Content[]) => {
  return content?.filter((item) => {
    if (item.filterTags?.includes(COUNTRY_FILTER_LABELS.nl)) return true;
    if (item.filterTags?.includes(COUNTRY_FILTER_LABELS.usa)) return true;
    if (item.filterTags?.includes(COUNTRY_FILTER_LABELS.ca)) return true;
    return true;
  });
};

const filterContentByGenre = (content: Content[]) => {
  return content?.filter((item) => {
    if (item.filterTags?.includes(GENRE_FILTER_LABELS.action)) return true;
    if (item.filterTags?.includes(GENRE_FILTER_LABELS.comedy)) return true;
    if (item.filterTags?.includes(GENRE_FILTER_LABELS.drama)) return true;
    return true;
  });
};

export const useFilteredContent = (content: Content[]) => [
  ...useFilterContentByDevice(content),
  ...filterContentByCountry(content),
  ...filterContentByGenre(content),
];
