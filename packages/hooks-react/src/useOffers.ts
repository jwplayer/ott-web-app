import { useQuery } from 'react-query';
import { useMemo, useState } from 'react';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import type { OfferType } from '@jwp/ott-common/types/account';
import type { Offer } from '@jwp/ott-common/types/checkout';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useCheckoutStore } from '@jwp/ott-common/src/stores/CheckoutStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import CheckoutController from '@jwp/ott-common/src/stores/CheckoutController';
import { isSVODOffer } from '@jwp/ott-common/src/utils/subscription';
import { ACCESS_MODEL } from '@jwp/ott-common/src/constants';

const useOffers = () => {
  const { offers, isSandbox, accessModel } = useConfigStore();

  const checkoutController = getModule(CheckoutController);

  const { requestedMediaOffers } = useCheckoutStore(({ requestedMediaOffers }) => ({ requestedMediaOffers }), shallow);
  const hasTvodOffer = (requestedMediaOffers || []).some((offer) => offer.offerId);
  const hasPremierOffer = (requestedMediaOffers || []).some((offer) => offer.premier);
  const isPPV = hasTvodOffer || hasPremierOffer;
  const [offerType, setOfferType] = useState<OfferType>(accessModel === ACCESS_MODEL.SVOD && !isPPV ? 'svod' : 'tvod');

  const offerIds: string[] = useMemo(() => {
    return [...(requestedMediaOffers || []).map(({ offerId }) => offerId), ...offers].filter(Boolean);
  }, [requestedMediaOffers, offers]);

  const { data: allOffers, isLoading } = useQuery(['offers', offerIds.join('-')], () => checkoutController.getOffers({ offerIds }, isSandbox));

  // The `offerQueries` variable mutates on each render which prevents the useMemo to work properly.
  return useMemo(() => {
    const offers = (allOffers || []).filter((offer: Offer) => (offerType === 'tvod' ? !isSVODOffer(offer) : isSVODOffer(offer)));
    const hasMultipleOfferTypes = (allOffers || []).some((offer: Offer) => (offerType === 'tvod' ? isSVODOffer(offer) : !isSVODOffer(offer)));

    const offersDict = (!isLoading && Object.fromEntries(offers.map((offer: Offer) => [offer.offerId, offer]))) || {};
    // we need to get the offerIds from the offer responses since it contains different offerIds based on the customers'
    // location. E.g. if an offer is configured as `S12345678` it becomes `S12345678_US` in the US.
    const defaultOfferId = (!isLoading && offers[offers.length - 1]?.offerId) || '';

    return {
      hasTVODOffers: offers.some((offer: Offer) => !isSVODOffer(offer)),
      hasMultipleOfferTypes,
      isLoading,
      hasPremierOffer,
      defaultOfferId,
      offerType,
      setOfferType,
      offers,
      offersDict,
      isTvodRequested: hasTvodOffer,
    };
  }, [allOffers, isLoading, hasPremierOffer, offerType, hasTvodOffer]);
};

export default useOffers;
