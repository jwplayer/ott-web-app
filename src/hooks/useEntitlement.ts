import { useQueries } from 'react-query';
import { useMemo } from 'react';
import shallow from 'zustand/shallow';

import type { MediaOffer } from '#types/media';
import type { GetEntitlementsResponse } from '#types/checkout';
import type { PlaylistItem } from '#types/playlist';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import { getEntitlements } from '#src/services/checkout.service';

export type UseEntitlementResult = {
  isEntitled: boolean;
  isMediaEntitlementLoading: boolean;
  mediaOffers: MediaOffer[];
};

export type UseEntitlement = (playlistItem?: PlaylistItem) => UseEntitlementResult;

type QueryResult = {
  responseData?: GetEntitlementsResponse;
};

const useEntitlement: UseEntitlement = (playlistItem) => {
  const { sandbox, accessModel } = useConfigStore(({ config, accessModel }) => ({ sandbox: config?.cleengSandbox, accessModel }), shallow);
  const { user, subscription, transactions, jwt } = useAccountStore(
    ({ user, subscription, transactions, auth }) => ({ user, subscription, transactions, jwt: auth?.jwt }),
    shallow,
  );

  const isItemFree = playlistItem?.requiresSubscription === 'false' || !!playlistItem?.free;
  const mediaOffers = playlistItem?.mediaOffers || [];
  const hasPremierOffer = mediaOffers?.some((offer) => offer.premier);
  const skipMediaEntitlement = isItemFree || (subscription && !hasPremierOffer);

  const mediaEntitlementQueries = useQueries(
    mediaOffers.map(({ offerId }) => ({
      queryKey: ['mediaOffer', offerId, transactions?.map((t) => t.transactionId).join(',')],
      queryFn: () => getEntitlements({ offerId }, sandbox, jwt || ''),
      enabled: !!playlistItem && !!jwt && !!offerId && !skipMediaEntitlement,
    })),
  );

  const { isMediaEntitled, isMediaEntitlementLoading } = useMemo(() => {
    const isEntitled = mediaEntitlementQueries.some((item) => item.isSuccess && (item.data as QueryResult)?.responseData?.accessGranted);

    return { isMediaEntitled: isEntitled, isMediaEntitlementLoading: !isEntitled && mediaEntitlementQueries.some((item) => item.isLoading) };
  }, [mediaEntitlementQueries]);

  const isEntitled = useMemo(() => {
    // Properties that make the item free: Access
    if (isItemFree) return true;

    // AVOD - Regular items free, TVOD items need entitlement
    if (accessModel === 'AVOD' && (!mediaOffers.length || isMediaEntitled)) return true;

    // AuthVOD - Regular items user should be logged in, TVOD items need entitlement
    if (accessModel === 'AUTHVOD' && !!user && (!mediaOffers.length || isMediaEntitled)) return true;

    // SVOD - Regular item and subscription? Access
    if (accessModel === 'SVOD' && !!subscription && !hasPremierOffer) return true;

    // SVOD + TVOD - No subscription or item is premier? Need entitlement
    if (accessModel === 'SVOD' && isMediaEntitled) return true;

    return false;
  }, [accessModel, user, subscription, mediaOffers.length, hasPremierOffer, isMediaEntitled]);

  return { isEntitled, isMediaEntitlementLoading, mediaOffers };
};

export default useEntitlement;
