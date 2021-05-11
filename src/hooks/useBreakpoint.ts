import { useState, useEffect } from 'react';

const XS_MATCH_MEDIA: MediaQueryList = window.matchMedia('screen and (max-width: 540px)');
const SM_MATCH_MEDIA: MediaQueryList = window.matchMedia('screen and (min-width: 541px) and (max-width: 960px)');
const MD_MATCH_MEDIA: MediaQueryList = window.matchMedia('screen and (min-width: 961px) and (max-width: 1280px)');
const LG_MATCH_MEDIA: MediaQueryList = window.matchMedia('screen and (min-width: 1281px) and (max-width: 1680px)');

export enum Breakpoint {
  xs,
  sm,
  md,
  lg,
  xl,
}

export type Breakpoints = {
  [Breakpoint.xs]: Breakpoint;
  [Breakpoint.sm]: Breakpoint;
  [Breakpoint.md]: Breakpoint;
  [Breakpoint.lg]: Breakpoint;
  [Breakpoint.xl]: Breakpoint;
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

    XS_MATCH_MEDIA.addEventListener('change', changeEventHandler);
    SM_MATCH_MEDIA.addEventListener('change', changeEventHandler);
    MD_MATCH_MEDIA.addEventListener('change', changeEventHandler);
    LG_MATCH_MEDIA.addEventListener('change', changeEventHandler);

    return () => {
      XS_MATCH_MEDIA.removeEventListener('change', changeEventHandler);
      SM_MATCH_MEDIA.removeEventListener('change', changeEventHandler);
      MD_MATCH_MEDIA.removeEventListener('change', changeEventHandler);
      LG_MATCH_MEDIA.removeEventListener('change', changeEventHandler);
    };
  }, []);

  return breakpoint;
};

export default useBreakpoint;
