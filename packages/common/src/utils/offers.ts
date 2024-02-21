import type { MediaOffer } from '../../types/media';

export const mergeOfferIds = (mediaOffers: MediaOffer[] = [], svodOfferIds: string[] = []) => {
  const mediaOfferIds = mediaOffers.map(({ offerId }) => offerId);

  return [...mediaOfferIds, ...svodOfferIds];
};
