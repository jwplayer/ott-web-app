import type { Content } from '@jwp/ott-common/types/config';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';

// TODO: Add more filtering logic here
export const useFilteredContent = (content: Content[]) => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint < Breakpoint.md;
  const filteredContent = isMobile ? content : content?.filter((item) => !item.filterTags?.includes('mobile'));

  return filteredContent;
};
