import { useState, useEffect } from 'react';

const XS_MATCH_MEDIA: MediaQueryList = window.matchMedia?.('screen and (max-width: 400px)');
const SM_MATCH_MEDIA: MediaQueryList = window.matchMedia?.('screen and (min-width: 320px) and (max-width: 719px)');
const MD_MATCH_MEDIA: MediaQueryList = window.matchMedia?.('screen and (min-width: 720px) and (max-width: 1023px)');
const LG_MATCH_MEDIA: MediaQueryList = window.matchMedia?.('screen and (min-width: 1024px) and (max-width: 1439px)');

export enum Breakpoint {
  xs,
  sm,
  md,
  lg,
  xl,
}

const getScreenSize = (): Breakpoint => {
  if (XS_MATCH_MEDIA?.matches) return Breakpoint.xs;
  if (SM_MATCH_MEDIA?.matches) return Breakpoint.sm;
  if (MD_MATCH_MEDIA?.matches) return Breakpoint.md;
  if (LG_MATCH_MEDIA?.matches) return Breakpoint.lg;
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
