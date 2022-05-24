import { useQueries } from 'react-query';
import { useMemo } from 'react';
import shallow from 'zustand/shallow';

import { useCheckoutStore } from '#src/stores/CheckoutStore';
import { getOffer } from '#src/services/checkout.service';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { PlaylistItem } from '#types/playlist';
import type { Offer } from '#types/checkout';

export type UseOffersResult = {
  tvodOffers: Offer[];
  monthlyOffer?: Offer;
  yearlyOffer?: Offer;
  hasPremierOffer: boolean;
  isLoadingOffers: boolean;
};

export type UseOffers = (playlistItem?: PlaylistItem) => UseOffersResult;

const useOffers: UseOffers = () => {
  const { cleengSandbox, json } = useConfigStore(({ config }) => config, shallow);
  const { requestedMediaOffers } = useCheckoutStore(({ requestedMediaOffers }) => ({ requestedMediaOffers: requestedMediaOffers || [] }), shallow);

  const offerIds: string[] = useMemo(() => {
    return [
      ...requestedMediaOffers.map(({ offerId }) => offerId),
      json?.cleengMonthlyOffer ? (json.cleengMonthlyOffer as string) : '',
      json?.cleengYearlyOffer ? (json.cleengYearlyOffer as string) : '',
    ].filter(Boolean);
  }, [requestedMediaOffers, json?.cleengMonthlyOffer, json?.cleengYearlyOffer]);

  const offerQueries = useQueries(
    offerIds.map((offerId) => ({
      queryKey: ['offer', offerId],
      queryFn: () => getOffer({ offerId }, cleengSandbox),
      enabled: !!offerId,
    })),
  );

  const isLoadingOffers = useMemo(() => offerQueries.some(({ isLoading }) => isLoading), [offerQueries]);

  const offers = useMemo(
    () => offerQueries.reduce<Offer[]>((prev, cur) => (cur.isSuccess && cur.data?.responseData ? [...prev, cur.data.responseData] : prev), []),
    [offerQueries],
  );
  const tvodOffers = useMemo(() => offers.filter((offer) => offer.period === null), [offers]);
  const hasPremierOffer = useMemo(() => !!requestedMediaOffers.some((offer) => offer.premier), [requestedMediaOffers]);
  const monthlyOffer = useMemo(() => (!hasPremierOffer ? offers.find((offer) => offer.period === 'month') : undefined), [hasPremierOffer, offers]);
  const yearlyOffer = useMemo(() => (!hasPremierOffer ? offers.find((offer) => offer.period === 'year') : undefined), [hasPremierOffer, offers]);

  return { tvodOffers, monthlyOffer, yearlyOffer, hasPremierOffer, isLoadingOffers };
};

export default useOffers;
