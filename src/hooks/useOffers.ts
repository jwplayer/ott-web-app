import { useQueries } from 'react-query';
import { useEffect, useMemo, useState } from 'react';
import shallow from 'zustand/shallow';

import { useCheckoutStore } from '#src/stores/CheckoutStore';
import { getOffer } from '#src/services/checkout.service';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { Offer } from '#types/checkout';
import type { OfferType } from '#types/account';
import { isSVODOffer } from '#src/utils/subscription';

const useOffers = () => {
  const {
    cleeng: { cleengSandbox, monthlyOfferId, yearlyOfferId },
    accessModel,
  } = useConfigStore(({ getCleengData, accessModel }) => ({ cleeng: getCleengData(), accessModel }), shallow);

  const { requestedMediaOffers } = useCheckoutStore(({ requestedMediaOffers }) => ({ requestedMediaOffers }), shallow);
  const hasPremierOffer = (requestedMediaOffers || []).some((offer) => offer.premier);
  const [offerType, setOfferType] = useState<OfferType>(accessModel === 'SVOD' ? 'svod' : 'tvod');

  const offerIds: string[] = useMemo(() => {
    return [...(requestedMediaOffers || []).map(({ offerId }) => offerId), monthlyOfferId, yearlyOfferId].filter(Boolean);
  }, [requestedMediaOffers, monthlyOfferId, yearlyOfferId]);

  const offerQueries = useQueries(
    offerIds.map((offerId) => ({
      queryKey: ['offer', offerId],
      queryFn: () => getOffer({ offerId }, cleengSandbox),
      enabled: !!offerId,
    })),
  );

  const isLoading = offerQueries.some(({ isLoading }) => isLoading);

  useEffect(() => {
    if (isLoading) return;
    if (hasPremierOffer) setOfferType('tvod');
  }, [isLoading, hasPremierOffer, setOfferType]);

  // The `offerQueries` variable mutates on each render which prevents the useMemo to work properly.
  return useMemo(() => {
    const allOffers = offerQueries.reduce<Offer[]>((prev, cur) => (cur.isSuccess && cur.data?.responseData ? [...prev, cur.data.responseData] : prev), []);
    const offers = allOffers.filter((offer) => (offerType === 'tvod' ? !isSVODOffer(offer) : isSVODOffer(offer)));
    const offersDict = Object.fromEntries(offers.map((offer) => [offer.offerId, offer]));
    // we need to get the offerIds from the offer responses since it contains different offerIds based on the customers
    // location. E.g. if an offer is configured as `S12345678` it becomes `S12345678_US` in the US.
    const defaultOfferId = offers[offers.length - 1]?.offerId;

    return {
      hasTVODOffers: allOffers.some((offer) => !isSVODOffer(offer)),
      isLoading,
      hasPremierOffer,
      defaultOfferId,
      offerType,
      setOfferType,
      offers,
      offersDict,
    };
  }, [requestedMediaOffers, offerQueries]);
};

export default useOffers;
