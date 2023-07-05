import type { ImageData } from '#types/playlist';

/** For backward compatibility (ImageData type support) */
export const getImage = (item: ImageData | string | undefined): string => {
  if (typeof item === 'object') {
    return item?.image || '';
  }

  return item || '';
};
