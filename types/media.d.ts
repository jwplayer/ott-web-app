export type Media = {
  description?: string;
  feed_instance_id: string;
  kind: string;
  title: string;
  playlist: PlaylistItem[];
};

export type MediaOffer = {
  offerId: string;
  forced: boolean;
};
