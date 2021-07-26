import type { Offer } from '../../types/checkout';

import { formatPrice } from './formatting';

export const getOfferPrice = (offer: Offer) => formatPrice(offer.customerPriceInclTax, offer.customerCurrency, offer.customerCountry);
