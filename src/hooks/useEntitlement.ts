import { useQueries } from 'react-query';
import { useMemo } from 'react';
import shallow from 'zustand/shallow';

import type { GetEntitlementsResponse } from '#types/checkout';
import { filterCleengMediaOffers } from '#src/utils/cleeng';
import type { PlaylistItem } from '#types/playlist';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import { getEntitlements } from '#src/services/checkout.service';

export type QueriesResult = {
  isMediaEntitled: boolean;
  isMediaEntitlementLoading: boolean;
};

export type UseEntitlementResult = {
  isEntitled: boolean;
  isMediaEntitlementLoading: boolean;
  hasMediaOffers: boolean;
  hasPremierOffer: boolean;
};

export type UseEntitlement = (playlistItem?: PlaylistItem) => UseEntitlementResult;

type QueryResult = {
  responseData?: GetEntitlementsResponse;
};

const useEntitlement: UseEntitlement = (playlistItem) => {
  const { sandbox, accessModel } = useConfigStore(({ config, accessModel }) => ({ sandbox: config?.cleengSandbox, accessModel }), shallow);
  const { user, subscription, jwt } = useAccountStore(({ user, subscription, auth }) => ({ user, subscription, jwt: auth?.jwt }), shallow);

  const isItemFree = playlistItem?.requiresSubscription === 'false' || !!playlistItem?.free;
  const mediaOffers = useMemo(() => filterCleengMediaOffers(playlistItem?.productIds) || [], [playlistItem]);
  const hasPremierOffer = mediaOffers?.some((offer) => offer.premier);
  const skipMediaEntitlement = isItemFree || (subscription && !hasPremierOffer);

  const mediaEntitlementQueries = useQueries(
    mediaOffers.map(({ offerId }) => ({
      queryKey: ['mediaOffer', offerId],
      queryFn: () => getEntitlements({ offerId }, sandbox, jwt || ''),
      enabled: !!playlistItem && !!jwt && !!offerId && !skipMediaEntitlement,
    })),
  );

  const { isMediaEntitled, isMediaEntitlementLoading } = useMemo(() => {
    const isEntitled = mediaEntitlementQueries.some((item) => item.isSuccess && (item as QueryResult)?.responseData?.accessGranted);

    return { isMediaEntitled: isEntitled, isMediaEntitlementLoading: !isEntitled && mediaEntitlementQueries.some((item) => item.isLoading) };
  }, [mediaEntitlementQueries]);

  const isEntitled = useMemo(() => {
    if (isItemFree) return true;
    if (accessModel === 'AVOD' && !mediaOffers) return true;
    if (accessModel === 'AUTHVOD' && !!user && !mediaOffers) return true;
    if (accessModel === 'SVOD' && !!subscription && !hasPremierOffer) return true;
    if (accessModel === 'SVOD' && isMediaEntitled) return true;

    return false;
  }, [accessModel, user, subscription]);

  return { isEntitled, isMediaEntitlementLoading, hasMediaOffers: mediaOffers?.length > 0, hasPremierOffer };
};

export default useEntitlement;
