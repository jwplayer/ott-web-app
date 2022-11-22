import { useState, useEffect } from 'react';

import { addMediaQueryListChangeListener, removeMediaQueryListChangeListener } from '#src/utils/matchMedia';

const XS_MATCH_MEDIA: MediaQueryList = matchMedia('screen and (max-width: 479px)'); // mobile
const SM_MATCH_MEDIA: MediaQueryList = matchMedia('screen and (min-width: 480px) and (max-width: 767px)'); // tablet
const MD_MATCH_MEDIA: MediaQueryList = matchMedia('screen and (min-width: 768px) and (max-width: 1023px)'); // tablet large
const LG_MATCH_MEDIA: MediaQueryList = matchMedia('screen and (min-width: 1024px) and (max-width: 1199px)'); // desktop

export enum Breakpoint {
  xs,
  sm,
  md,
  lg,
  xl,
}

export type Breakpoints = {
  [Breakpoint.xs]: number;
  [Breakpoint.sm]: number;
  [Breakpoint.md]: number;
  [Breakpoint.lg]: number;
  [Breakpoint.xl]: number;
};

const getScreenSize = (): Breakpoint => {
  if (XS_MATCH_MEDIA.matches) return Breakpoint.xs;
  if (SM_MATCH_MEDIA.matches) return Breakpoint.sm;
  if (MD_MATCH_MEDIA.matches) return Breakpoint.md;
  if (LG_MATCH_MEDIA.matches) return Breakpoint.lg;
  else return Breakpoint.xl;
};

const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => getScreenSize());

  useEffect(() => {
    const changeEventHandler = (): void => setBreakpoint(getScreenSize());

    addMediaQueryListChangeListener(XS_MATCH_MEDIA, changeEventHandler);
    addMediaQueryListChangeListener(SM_MATCH_MEDIA, changeEventHandler);
    addMediaQueryListChangeListener(MD_MATCH_MEDIA, changeEventHandler);
    addMediaQueryListChangeListener(LG_MATCH_MEDIA, changeEventHandler);

    return () => {
      removeMediaQueryListChangeListener(XS_MATCH_MEDIA, changeEventHandler);
      removeMediaQueryListChangeListener(SM_MATCH_MEDIA, changeEventHandler);
      removeMediaQueryListChangeListener(MD_MATCH_MEDIA, changeEventHandler);
      removeMediaQueryListChangeListener(LG_MATCH_MEDIA, changeEventHandler);
    };
  }, []);

  return breakpoint;
};

export default useBreakpoint;
