import type { MediaStatus } from '../src/utils/liveEvent';

import type { MediaOffer } from './media';

export type CustomParams = {
  cardImage?: string;
  backgroundImage?: string;
  channelLogoImage?: string;
  genre?: string;
  rating?: string;
  requiresSubscription?: string | null;
  seriesId?: string;
  episodeNumber?: string;
  seasonNumber?: string;
  trailerId?: string;
  free?: string;
  productIds?: string;
  mediaOffers?: MediaOffer[] | null;
  contentType?: string;
  liveChannelsId?: string;
  scheduleUrl?: string | null;
  scheduleToken?: string;
  scheduleDataFormat?: string;
  scheduleDemo?: string;
  catchupHours?: string;
  mediaStatus?: MediaStatus;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  markdown?: string;
  scheduleType?: string;
  [key: string]: unknown;
};
