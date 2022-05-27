import { formatPrice } from '#src/utils/formatting';
import type { Offer } from '#types/checkout';

export const getOfferPrice = (offer: Offer) => formatPrice(offer.customerPriceInclTax, offer.customerCurrency, offer.customerCountry);

export const isSVODOffer = (offer: Offer) => offer.offerId[0] === 'S';
