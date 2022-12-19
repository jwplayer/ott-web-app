import { useQuery } from 'react-query';
import { useEffect, useMemo, useState } from 'react';
import shallow from 'zustand/shallow';

import useClientIntegration from './useClientIntegration';

import { useCheckoutStore } from '#src/stores/CheckoutStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { Offer } from '#types/checkout';
import type { OfferType } from '#types/account';
import { isSVODOffer } from '#src/utils/subscription';

const useOffers = () => {
  const {
    cleeng: { cleengSandbox, monthlyOfferId, yearlyOfferId },
    accessModel,
  } = useConfigStore(({ getCleengData, accessModel }) => ({ cleeng: getCleengData(), accessModel }), shallow);
  const { checkoutService, integration } = useClientIntegration();

  const { requestedMediaOffers } = useCheckoutStore(({ requestedMediaOffers }) => ({ requestedMediaOffers }), shallow);
  const hasPremierOffer = (requestedMediaOffers || []).some((offer) => offer.premier);
  const [offerType, setOfferType] = useState<OfferType>(accessModel === 'SVOD' ? 'svod' : 'tvod');

  const offerIds: string[] = useMemo(() => {
    const ids = [monthlyOfferId, yearlyOfferId];
    if (integration.inplayer?.assetId) {
      ids.push(integration.inplayer?.assetId.toString());
    }
    return [...(requestedMediaOffers || []).map(({ offerId }) => offerId), ...ids].filter(Boolean);
  }, [requestedMediaOffers, monthlyOfferId, yearlyOfferId]);

  const { data: allOffers = [], isLoading } = useQuery(['offers', offerIds.join('-')], () => checkoutService.getOffers({ offerIds }, cleengSandbox));

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
