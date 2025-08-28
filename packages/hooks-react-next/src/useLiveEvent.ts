import type { PlaylistItem } from '@jwp/ott-common-next/types/playlist';
import { isLiveEvent, isPlayable } from '@jwp/ott-common-next/src/utils/liveEvent';

export function useLiveEvent(media: PlaylistItem) {
  return {
    isLiveEvent: isLiveEvent(media),
    isPlayable: isPlayable(media),
  };
}
