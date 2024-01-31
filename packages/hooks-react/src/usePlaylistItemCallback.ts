import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { createURL } from '@jwp/ott-common/src/utils/urlFormatting';

import useEventCallback from './useEventCallback';

export const usePlaylistItemCallback = (startDateTime?: string | null, endDateTime?: string | null) => {
  const applyLiveStreamOffset = (item: PlaylistItem) => {
    if (!startDateTime) return item;

    // The timeParam can either be just a start date like `2022-08-08T20:00:00` (to extend DVR) or a range like
    // `2022-08-08T20:00:00-2022-08-08T22:00:00` to select a VOD from the live stream.
    const timeParam = [startDateTime, endDateTime].filter(Boolean).join('-');

    return {
      ...item,
      allSources: undefined, // `allSources` need to be cleared otherwise JW Player will use those instead
      sources: item.sources.map((source) => ({
        ...source,
        file: createURL(source.file, {
          t: timeParam,
        }),
      })),
    };
  };

  return useEventCallback(async (item: PlaylistItem) => {
    return applyLiveStreamOffset(item);
  });
};
