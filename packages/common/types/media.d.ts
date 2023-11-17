export type GetMediaParams = { poster_width?: number; default_source_fallback?: boolean; token?: string; max_resolution?: number };

export type Media = {
  description?: string;
  feed_instance_id: string;
  kind: string;
  title: string;
  playlist: PlaylistItem[];
};

export type MediaOffer = {
  offerId: string;
  premier: boolean;
};
