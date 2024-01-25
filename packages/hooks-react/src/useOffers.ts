import { useQuery } from 'react-query';
import { useMemo, useState } from 'react';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { mergeOfferIds } from '@jwp/ott-common/src/utils/offers';
import type { OfferType } from '@jwp/ott-common/types/account';
import type { Offer } from '@jwp/ott-common/types/checkout';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useCheckoutStore } from '@jwp/ott-common/src/stores/CheckoutStore';
import CheckoutController from '@jwp/ott-common/src/stores/CheckoutController';
import { isSVODOffer } from '@jwp/ott-common/src/utils/subscription';

const useOffers = () => {
  const checkoutController = getModule(CheckoutController);
  const svodOfferIds = checkoutController.getSubscriptionOfferIds();
  const { requestedMediaOffers: mediaOffers } = useCheckoutStore(({ requestedMediaOffers }) => ({ requestedMediaOffers }), shallow);
  const hasPremierOffers = mediaOffers?.some((offer) => offer.premier);
  const hasMultipleOfferTypes = !hasPremierOffers && !!mediaOffers?.length && !!svodOfferIds.length;
  const offerIds: string[] = mergeOfferIds(mediaOffers || [], svodOfferIds);

  const [offerType, setOfferType] = useState<OfferType>(hasPremierOffers || !svodOfferIds ? 'tvod' : 'svod');
  const updateOfferType = useMemo(() => (hasMultipleOfferTypes ? (type: OfferType) => setOfferType(type) : undefined), [hasMultipleOfferTypes]);

  const { data: allOffers, isLoading } = useQuery(['offers', offerIds.join('-')], () => checkoutController.getOffers({ offerIds }));

  // The `offerQueries` variable mutates on each render which prevents the useMemo to work properly.
  return useMemo(() => {
    const offers = (allOffers || []).filter((offer: Offer) => (offerType === 'tvod' ? !isSVODOffer(offer) : isSVODOffer(offer)));

    const offersDict = (!isLoading && Object.fromEntries(offers.map((offer: Offer) => [offer.offerId, offer]))) || {};
    // we need to get the offerIds from the offer responses since it contains different offerIds based on the customers'
    // location. E.g. if an offer is configured as `S12345678` it becomes `S12345678_US` in the US.
    const defaultOfferId = (!isLoading && offers[offers.length - 1]?.offerId) || '';

    return {
      hasMediaOffers: allOffers?.some((offer: Offer) => !isSVODOffer(offer)),
      isLoading,
      defaultOfferId,
      offerType,
      setOfferType: updateOfferType,
      offers,
      offersDict,
    };
  }, [allOffers, isLoading, offerType, updateOfferType]);
};

export default useOffers;
