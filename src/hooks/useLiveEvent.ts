import type { PlaylistItem } from '../../types/playlist';
import { isLiveEvent, isPlayable } from '../utils/liveEvent';

export function useLiveEvent(media: PlaylistItem) {
  return {
    isLiveEvent: isLiveEvent(media),
    isPlayable: isPlayable(media),
  };
}
