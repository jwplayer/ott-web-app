import { formatPrice } from '#src/utils/formatting';
import type { Offer, Order } from '#types/checkout';

export const getOfferPrice = (offer: Offer) => formatPrice(offer.customerPriceInclTax, offer.customerCurrency, offer.customerCountry);

export const isSVODOffer = (offer: Offer | Order) => offer.offerId?.[0] === 'S';
