import { useState, useEffect } from 'react';

const XS_MATCH_MEDIA: MediaQueryList = window.matchMedia('screen and (max-width: 599px)');
const SM_MATCH_MEDIA: MediaQueryList = window.matchMedia('screen and (min-width: 600px) and (max-width: 959px)');
const MD_MATCH_MEDIA: MediaQueryList = window.matchMedia('screen and (min-width: 960px) and (max-width: 1279px)');
const LG_MATCH_MEDIA: MediaQueryList = window.matchMedia('screen and (min-width: 1280px) and (max-width: 1919px)');

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
