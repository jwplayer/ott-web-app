import type { Offer, Order } from '../../types/checkout';
import type { MediaOffer } from '../../types/media';

import { formatPrice } from './formatting';

export const getOfferPrice = (offer: Offer) => formatPrice(offer.customerPriceInclTax, offer.customerCurrency, offer.customerCountry);

export const isSVODOffer = (offer: Offer | Order) => offer.offerId?.[0] === 'S';

export const mergeOfferIds = (mediaOffers: MediaOffer[] = [], svodOfferIds: string[] = []) => {
  const mediaOfferIds = mediaOffers.map(({ offerId }) => offerId);

  return [...mediaOfferIds, ...svodOfferIds];
};
