import type { PlaylistItem } from '../../types/playlist';
import { getMediaStatusFromEventState, isLiveEvent, isPlayable } from '../utils/liveEvent';

export function useLiveEvent(media: PlaylistItem) {
  return {
    isLiveEvent: isLiveEvent(media),
    mediaStatus: getMediaStatusFromEventState(media),
    isPlayable: isPlayable(media),
  };
}
