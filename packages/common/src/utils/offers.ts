import type { Offer, Order } from '../../types/checkout';

import { formatPrice } from './formatting';

export const getOfferPrice = (offer: Offer) => formatPrice(offer.customerPriceInclTax, offer.customerCurrency, offer.customerCountry);

export const isSVODOffer = (offer: Offer | Order) => offer.offerId?.[0] === 'S';
