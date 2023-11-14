import { useQueries } from 'react-query';
import shallow from 'zustand/shallow';

import type { MediaOffer } from '#types/media';
import type { GetEntitlementsResponse } from '#types/checkout';
import type { PlaylistItem } from '#types/playlist';
import { isLocked } from '#src/utils/entitlements';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import CheckoutController from '#src/stores/CheckoutController';
import { getModule } from '#src/modules/container';

export type UseEntitlementResult = {
  isEntitled: boolean;
  isMediaEntitlementLoading: boolean;
  mediaOffers: MediaOffer[];
};

export type UseEntitlement = (playlistItem?: PlaylistItem) => UseEntitlementResult;

type QueryResult = {
  responseData?: GetEntitlementsResponse;
};

const notifyOnChangeProps = ['data' as const, 'isLoading' as const];

/**
 * useEntitlement()
 *
 * Free items: Access
 * AVOD - Regular items free, TVOD items need entitlement
 * AuthVOD - For regular items user should be logged in, TVOD items need entitlement
 * SVOD - For regular items user should have subscription OR entitlement, premier items need entitlement
 *
 *  */
const useEntitlement: UseEntitlement = (playlistItem) => {
  const { accessModel, isSandbox } = useConfigStore();
  const { user, subscription } = useAccountStore(
    ({ user, subscription }) => ({
      user,
      subscription,
    }),
    shallow,
  );

  const checkoutController = getModule(CheckoutController, false);

  const isPreEntitled = playlistItem && !isLocked(accessModel, !!user, !!subscription, playlistItem);
  const mediaOffers = playlistItem?.mediaOffers || [];

  // this query is invalidated when the subscription gets reloaded
  const mediaEntitlementQueries = useQueries(
    mediaOffers.map(({ offerId }) => ({
      queryKey: ['entitlements', offerId],
      queryFn: () => checkoutController?.getEntitlements({ offerId }, isSandbox),
      enabled: !!playlistItem && !!user && !!user.id && !!offerId && !isPreEntitled,
      refetchOnMount: 'always' as const,
      notifyOnChangeProps,
    })),
  );

  // when the user is logged out the useQueries will be disabled but could potentially return its cached data
  const isMediaEntitled = !!user && mediaEntitlementQueries.some((item) => item.isSuccess && (item.data as QueryResult)?.responseData?.accessGranted);
  const isMediaEntitlementLoading = !isMediaEntitled && mediaEntitlementQueries.some((item) => item.isLoading);

  const isEntitled = !!playlistItem && (isPreEntitled || isMediaEntitled);

  return { isEntitled, isMediaEntitlementLoading, mediaOffers };
};

export default useEntitlement;
