import { useQueries } from 'react-query';
import { useMemo } from 'react';
import shallow from 'zustand/shallow';

import { isLocked } from '../utils/entitlements';

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

  const isPreEntitled = playlistItem && !isLocked(accessModel, !!user, !!subscription, playlistItem);
  const mediaOffers = playlistItem?.mediaOffers || [];

  const mediaEntitlementQueries = useQueries(
    mediaOffers.map(({ offerId }) => ({
      queryKey: ['mediaOffer', offerId, transactions?.map((t) => t.transactionId).join(',')],
      queryFn: () => getEntitlements({ offerId }, sandbox, jwt || ''),
      enabled: !!playlistItem && !!jwt && !!offerId && !isPreEntitled,
    })),
  );

  const { isMediaEntitled, isMediaEntitlementLoading } = useMemo(() => {
    const isEntitled = mediaEntitlementQueries.some((item) => item.isSuccess && (item.data as QueryResult)?.responseData?.accessGranted);

    return { isMediaEntitled: isEntitled, isMediaEntitlementLoading: !isEntitled && mediaEntitlementQueries.some((item) => item.isLoading) };
  }, [mediaEntitlementQueries]);

  // Properties that make the item free: Access
  // AVOD - Regular items free, TVOD items need entitlement
  // AuthVOD - Regular items user should be logged in, TVOD items need entitlement
  // SVOD - Regular item user should have subscription OR entitlement, premier items only entitlement

  return { isEntitled: !!playlistItem && (isPreEntitled || isMediaEntitled), isMediaEntitlementLoading, mediaOffers };
};

export default useEntitlement;
