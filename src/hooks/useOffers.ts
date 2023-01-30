import { useQuery } from 'react-query';
import { useEffect, useMemo, useState } from 'react';
import shallow from 'zustand/shallow';

import useClientIntegration from './useClientIntegration';
import useService, { CheckoutService } from './useService';

import { useCheckoutStore } from '#src/stores/CheckoutStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { Offer } from '#types/checkout';
import type { OfferType } from '#types/account';
import { isSVODOffer } from '#src/utils/subscription';

const useOffers = () => {
  const { accessModel } = useConfigStore();
  const { clientOffers, sandbox } = useClientIntegration();

  const checkoutService: CheckoutService = useService(({ checkoutService }) => checkoutService);
  if (!checkoutService) throw new Error('checkout service is not available');

  const { requestedMediaOffers } = useCheckoutStore(({ requestedMediaOffers }) => ({ requestedMediaOffers }), shallow);
  const hasPremierOffer = (requestedMediaOffers || []).some((offer) => offer.premier);
  const [offerType, setOfferType] = useState<OfferType>(accessModel === 'SVOD' ? 'svod' : 'tvod');

  const offerIds: string[] = useMemo(() => {
    return [...(requestedMediaOffers || []).map(({ offerId }) => offerId), ...clientOffers].filter(Boolean);
  }, [requestedMediaOffers, clientOffers]);

  const { data: allOffers = [], isLoading } = useQuery(['offers', offerIds.join('-')], () => checkoutService.getOffers({ offerIds }, sandbox));

  useEffect(() => {
    if (isLoading) return;
    if (hasPremierOffer) setOfferType('tvod');
  }, [isLoading, hasPremierOffer, setOfferType]);

  // The `offerQueries` variable mutates on each render which prevents the useMemo to work properly.
  return useMemo(() => {
    const offers = allOffers.filter((offer: Offer) => (offerType === 'tvod' ? !isSVODOffer(offer) : isSVODOffer(offer)));
    const offersDict = (!isLoading && Object.fromEntries(offers.map((offer: Offer) => [offer.offerId, offer]))) || {};
    // we need to get the offerIds from the offer responses since it contains different offerIds based on the customers
    // location. E.g. if an offer is configured as `S12345678` it becomes `S12345678_US` in the US.
    const defaultOfferId = (!isLoading && offers[offers.length - 1]?.offerId) || '';

    return {
      hasTVODOffers: offers.some((offer: Offer) => !isSVODOffer(offer)),
      isLoading,
      hasPremierOffer,
      defaultOfferId,
      offerType,
      setOfferType,
      offers,
      offersDict,
    };
  }, [requestedMediaOffers, allOffers]);
};

export default useOffers;
