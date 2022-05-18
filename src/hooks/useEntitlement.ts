import { useQueries } from 'react-query';
import { useMemo } from 'react';

import type { GetEntitlementsResponse } from '../../types/checkout';

import { ConfigStore } from '#src/stores/ConfigStore';
import { AccountStore } from '#src/stores/AccountStore';
import { getEntitlements } from '#src/services/checkout.service';

export type UseEntitlementResult = {
  isEntitled: boolean;
  isLoading: boolean;
  error: unknown | null;
};

export type UseEntitlement = (offerIds?: string[], enabled?: boolean) => UseEntitlementResult;

type QueryResult = {
  responseData?: GetEntitlementsResponse;
};

const useEntitlement: UseEntitlement = (offerIds = [], enabled = true) => {
  const sandbox = ConfigStore.useState(({ config }) => config?.cleengSandbox);
  const jwt = AccountStore.useState(({ auth }) => auth?.jwt);

  const entitlementQueries = useQueries(
    offerIds.map((offerId) => ({
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
