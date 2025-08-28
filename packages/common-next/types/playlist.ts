import type { CustomParams } from './custom-params';

export type GetPlaylistParams = { page_limit?: number; token?: string; search?: string; related_media_id?: string };

export type Image = {
  src: string;
  type: string;
  width: number;
};

export type DRM = {
  playready?: {
    url: string;
  };
  widevine?: {
    url: string;
  };
  fairplay?: {
    processSpcUrl: string;
    certificateUrl: string;
  };
};

export type Source = {
  file: string;
  type: string;
  drm?: DRM;
};

export type Track = {
  file: string;
  kind: string;
  label?: string;
};

export type PlaylistItem = {
  description: string;
  duration: number;
  feedid: string;
  image: string;
  images: Image[];
  link: string;
  mediaid: string;
  pubdate: number;
  sources: Source[];
  tags?: string;
  title: string;
  tracks?: Track[];
  variations?: Record<string, unknown>;
} & CustomParams;

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
  contentType?: string;
  /**
   * @deprecated Use {@link Playlist.cardImageAspectRatio} instead.
   */
  shelfImageAspectRatio?: string;
  cardImageAspectRatio?: string;
  imageLabel?: string;
  [key: string]: unknown;
};
