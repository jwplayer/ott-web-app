import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { isLiveEvent, isPlayable } from '@jwp/ott-common/src/utils/liveEvent';

export function useLiveEvent(media: PlaylistItem) {
  return {
    isLiveEvent: isLiveEvent(media),
    isPlayable: isPlayable(media),
  };
}
