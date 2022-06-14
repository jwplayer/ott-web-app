import type { PlaylistItem } from './playlist';

export type Favorite = {
  mediaid: string;
  title: string;
  tags: string;
  duration: number;
  playlistItem: PlaylistItem;
};

export type SerializedFavorite = {
  mediaid: string;
};
