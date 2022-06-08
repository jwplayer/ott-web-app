import type { PlaylistItem } from './playlist';

export type WatchHistoryItem = {
  mediaid: string;
  title: string;
  tags: string;
  duration: number;
  progress: number;
  playlistItem?: PlaylistItem;
};

export type SerializedWatchHistoryItem = {
  mediaid: string;
  progress: number;
};
