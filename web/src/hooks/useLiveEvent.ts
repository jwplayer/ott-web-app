import type { PlaylistItem } from '@jwplayer/ott-common/types/playlist';
import { isLiveEvent, isPlayable } from '@jwplayer/ott-common/src/utils/liveEvent';

export function useLiveEvent(media: PlaylistItem) {
  return {
    isLiveEvent: isLiveEvent(media),
    isPlayable: isPlayable(media),
  };
}
