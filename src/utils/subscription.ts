import type { Offer } from '../../types/checkout';

export const getOfferPrice = (offer: Offer) => {
  return new Intl.NumberFormat(offer.customerCountry, {
    style: 'currency',
    currency: offer.customerCurrency,
  }).format(offer.customerPriceInclTax);
};
