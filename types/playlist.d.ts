export type Image = {
  src: string;
  type: string;
  width: number;
};

export type Source = {
  file: string;
  type: string;
};

export type Track = {
  file: string;
  kind: string;
  label?: string;
};

export type PlaylistItem = {
  description: string;
  duration: number;
  episodeNumber?: string;
  feedid: string;
  image: string;
  images: Image[];
  link: string;
  genre: string;
  mediaid: string;
  pubdate: number;
  rating: string;
  seasonNumber?: string;
  sources: Source[];
  seriesId?: string;
  tags: string;
  trailerId?: string;
  title: string;
  tracks: Track[];
  variations?: Record<string, unknown>;
};

export type Link = {
  first?: string;
  last?: string;
};

export type Playlist = {
  description?: string;
  feed_instance_id?: string;
  feedid?: string;
  kind?: string;
  links?: Link;
  playlist: PlaylistItem[];
  title: string;
};

export type Media = {
  description?: string;
  feed_instance_id: string;
  kind: string;
  playlist: PlaylistItem[];
};
