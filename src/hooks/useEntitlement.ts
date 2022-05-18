import { useQueries } from 'react-query';
import { useMemo } from 'react';

import type { GetEntitlementsResponse } from '../../types/checkout';
import type { MediaOffer } from '../../types/media';

import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import { getEntitlements } from '#src/services/checkout.service';

export type UseEntitlementResult = {
  isEntitled: boolean;
  isLoading: boolean;
  error: unknown | null;
};

export type UseEntitlement = (mediaOffers?: MediaOffer[], enabled?: boolean) => UseEntitlementResult;

type QueryResult = {
  responseData?: GetEntitlementsResponse;
};

const useEntitlement: UseEntitlement = (mediaOffers = [], enabled = true) => {
  const sandbox = useConfigStore(({ config }) => config?.cleengSandbox);
  const jwt = useAccountStore(({ auth }) => auth?.jwt);

  const entitlementQueries = useQueries(
    mediaOffers.map(({ offerId }) => ({
      queryKey: ['mediaOffer', offerId],
      queryFn: () => getEntitlements({ offerId: offerId || '' }, sandbox, jwt || ''),
      enabled: enabled && !!jwt && !!offerId,
    })),
  );

  const evaluateEntitlement = (queryResult: QueryResult) => !!queryResult?.responseData?.accessGranted;

  return useMemo(
    () =>
      entitlementQueries.reduce<UseEntitlementResult>(
        (prev, cur) => ({
          isLoading: prev.isLoading || cur.isLoading,
          error: prev.error || cur.error,
          isEntitled: prev.isEntitled || (cur.isSuccess && evaluateEntitlement(cur as QueryResult)),
        }),
        { isEntitled: false, isLoading: false, error: null },
      ),
    [entitlementQueries],
  );
};

export default useEntitlement;
