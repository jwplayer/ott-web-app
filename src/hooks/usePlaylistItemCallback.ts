import useEventCallback from '#src/hooks/useEventCallback';
import type { PlaylistItem } from '#types/playlist';
import { addQueryParams } from '#src/utils/formatting';

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
        file: addQueryParams(source.file, {
          t: timeParam,
        }),
      })),
    };
  };

  return useEventCallback(async (item: PlaylistItem) => {
    return applyLiveStreamOffset(item);
  });
};
